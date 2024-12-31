require('dotenv/config');
require('dotenv').config();
const fs=require('fs');
const { Dropbox } =require('dropbox');


const dbx=new Dropbox({accessToken: process.env.DROPBOX_ACCESS_TOKEN })
const DropboxUpload=(uploadPath,)=>{
    return new Promise(async(resolve,reject)=>{
        try{

        }
        catch(err)
        {
            console.log(err);
            reject(err);
        }
    });
}