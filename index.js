import {app, port} from './server.js' 
import runMigrations from './src/db/migrations/migrations.js';

async function start() {
    await runMigrations();

    //Listen and serve
    app.listen(port, () => {
        console.log(`Server listening at port:${port}`)
    });

}

start();