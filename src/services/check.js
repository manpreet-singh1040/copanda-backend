

const lang=`java`;
const code=`import java.util.*;
import java.io.*;
public class test
{
	public static void main(String[] args) {
		try{

			File input=new File("input.txt");
			System.out.println("Hello World");
			Scanner sc=new Scanner(input);
			int a=sc.nextInt();
			System.out.println(a);
			int b=sc.nextInt();
			System.out.println(b);
			sc.close();
		}
		catch(FileNotFoundException e){
			System.out.println(e);
		}
	}
}`;
const input=`5
10`;
const userid=`1234`;

let body={code,lang,input,userid};

const fun=async(body)=>{
    let response=await fetch(`http://localhost:6996/java`,{
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
            console.log(`err!!!`);
        }
};

fun(body);
//const temp="\x01\x00\x00\x00\x00\x00\x00\fHello World\n\x01\x00\x00\x00\x00\x00\x00\x055\n10\n";
//console.log(temp);