const fs=require('fs');
const { Dropbox } =require('dropbox');
// const fetch = require('isomorphic-fetch');
const ACCESS_TOKEN='sl.CDpxmQKFP-SJkkxp5m21TeuLp1eZ0asPnumVdNDumA7niTJQIBBNJo3ImDxaMwYsQdpOth0p1IqjWc8-hLQo0Upx4Fz5Lqawqfvlzg9Z0V9O94f17iqBQFxmj9gG2hgl3qooA_-EPLqcFsdSHvB70e0'
// const dropboxUpload=async()=>{
//     try{
//         const dbx=new Dropbox({ accessToken:ACCESS_TOKEN });
//         const fileContent=fs.readFileSync('./handleExecution.js');
//         const filePath='/example.txt';
//         const response = await dbx.filesUpload({
//             path: filePath,
//             contents: fileContent,
//           });
//         // const response=await dbx.filesListFolder({path: ''});
//           console.log('File uploaded successfully:', response.result);
//     }
//     catch(err){
//         console.log(err);
//     }
// };




// dropboxUpload();



const downloadFile = async () => {
    try {
      const dbx = new Dropbox({ accessToken: ACCESS_TOKEN});
  
      // Path of the file in Dropbox
      const filePath = '/example.txt';
  
      // Make the API call to download the file
      const response = await dbx.filesDownload({ path: filePath});
  
      // Save the downloaded content to a local file
      fs.writeFileSync('local_example.js', response.result.fileBinary, 'binary');
  
      console.log('File downloaded and saved as local_example.txt!');
      console.log(response);
    } catch (error) {
      console.error('Error downloading file:', error.message);
    }
  };
  downloadFile();



    //   const dbx = new Dropbox({ accessToken: ACCESS_TOKEN});
    //   dbx.filesDownload({path:"/example.txt"})
    //   .then((response) => {
    //     // Write the file to the local system
    //     // fs.writeFileSync(localFilePath, response.result.fileBinary, 'binary');
    //     console.log('File downloaded successfully!');
    //     console.log(response);
    //   })
    //   .catch((error) => {
    //     console.error('Error downloading file:', error);
    //   });