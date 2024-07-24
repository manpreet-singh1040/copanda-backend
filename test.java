import java.util.*;
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
}