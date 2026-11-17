
require('dotenv').config();

const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

const redis = new Redis(process.env.REDIS_URL);

const LANGUAGE_CONFIG = {
  cpp: { queue: "CPP_QUEUE" },
  c: { queue: "C_QUEUE" },
  python: { queue: "PYTHON_QUEUE" },
  js: { queue: "JS_QUEUE" },
  java: { queue: "JAVA_QUEUE" },
};

const testexe = async (req, res) => {
    const { code, input, lang, userId, quesId } = req.body;
    // Validate required fields
    if (!code || !lang || !userId) {
        return res.status(400).json({
            status: false,
            mes: 'Due to incomplete data!!'
        });
    }

    const jobId = uuidv4();

    const jobData = {
        code,
        input: input || '',
        lang: lang.toLowerCase().trim(),
        userId,
        quesId,
        jobId
    };

    let lockAcquired = false;

    try {
        // Acquire compilation lock atomically
        const queueName = LANGUAGE_CONFIG[jobData.lang]?.queue;
        if (!queueName) {
            return res.status(400).json({
                status: false,
                mes: 'Unsupported language!!'
            });
        }
        const lock = await redis.set(
            userId,
            'TRUE',
            'EX',
            60,
            'NX'
        );

        if (lock !== 'OK') {
            return res.status(409).json({
                status: false,
                mes: 'Already compiling!!'
            });
        }

        lockAcquired = true;

        console.log('New submission:', jobData);

        const redisJobPayload = JSON.stringify(jobData);

        // Add job to Redis queue
        const queueLength = await redis.lpush(
            queueName,
            redisJobPayload
        );

        console.log(
            `Job added to ${queueName}. Queue length: ${queueLength}`
        );

        return res.status(200).json({
            status: true,
            submissionId: jobId,
            mes: 'Job added to queue!!'
        });

    } catch (err) {
        console.error('Submission error:', err);

        // Release lock if enqueueing failed
        if (lockAcquired) {
            await redis.eval(
                `
                if redis.call("GET", KEYS[1]) == "TRUE" then
                    return redis.call("DEL", KEYS[1])
                end
                return 0
                `,
                1,
                userId
            ).catch(console.error);
        }

        return res.status(500).json({
            status: false,
            mes: 'Internal server error!!'
        });
    }
};

module.exports = testexe;
