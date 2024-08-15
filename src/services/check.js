

const lang=`java`;
const code=`import java.util.*;
import java.io.*;
public class Main
{
	public static void main(String[] args) {

			System.out.println("fuck u");
			Scanner sc=new Scanner(System.in);
			int a=sc.nextInt();
			System.out.println(a);
			int b=sc.nextInt();
			System.out.println("hell yeah baby!!!");
			sc.close();
		
	}
}`;
const input=`5
10`;
const userid=`ash123`;

let body={code,lang,input,userid};

const fun=async(body)=>{
    let response=await fetch(`http://20.40.50.186:6996/`,{
    //let response=await fetch(`http://localhost:3000/exec`,{
        method:'POST',
        headers:{'Content-Type': 'application/json'},
        body:JSON.stringify(body),
    })
    if(response.ok)
        {
            let q=await response.json();
           
            console.log(q);
           // console.log(q.response.replace(/\+/g, ''));
        }
        else{
            console.log(response);
        }
};

fun(body);

const fun2 = async () => {
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    const conid = `9c2fae4fae934bafb6dc14e74ade60165968c560e170248db5095031de7a5f19`;

    // The multi-line code to be appended
    const code = `import java.util.*;
import java.io.*;
public class ash123
{
    public static void main(String[] args) {
        try{
            File input = new File("ash123.txt");
            System.out.println("fuck u");
            Scanner sc = new Scanner(input);
            int a = sc.nextInt();
            System.out.println(a);
            int b = sc.nextInt();
            System.out.println(b);
            sc.close();
        }
        catch(FileNotFoundException e){
            System.out.println(e);
        }
    }
}`;

    // Use a Here Document to pass the multi-line string into the shell command
    const cmd = `docker exec -d ${conid} sh -c "cat << 'EOF' >> Main.java
${code}
EOF"`;

    try {
        // Log the command for debugging
        console.log(`Executing: ${cmd}`);
        
        // Execute the command
        await execPromise(cmd);
        console.log('done!!');
    } catch (err) {
        console.error('Error:', err);
    }
};

//fun2();


