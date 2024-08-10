

const lang=`java`;
const code=`import java.util.*;
import java.io.*;
public class ash123
{
	public static void main(String[] args) {
		try{

			File input=new File("ash123.txt");
			System.out.println("fuck u");
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
const subId=`ash123`;

let body={code,lang,input,subId};

const fun=async(body)=>{
    let response=await fetch(`http://20.40.50.186:6996/java`,{
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