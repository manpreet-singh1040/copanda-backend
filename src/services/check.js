

const code=`import java.util.*;
public class test2
{
	public static void main(String[] args) {
		System.out.println("Hello World");
		Scanner sc=new Scanner(System.in);
		int a=sc.nextInt();
		System.out.println(a);
		int b=sc.nextInt();
		System.out.println(b);
		sc.close();
	}
}
`;
const lang=`java`;
const input=`35\n65`;
const userid=`1234`;

let body={code,lang,input,userid};

const fun=async(body)=>{
    let response=await fetch(`http://localhost:3000/testexe`,{
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