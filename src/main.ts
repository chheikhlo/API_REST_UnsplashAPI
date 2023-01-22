import fetch from "cross-fetch";
import { createApi } from "unsplash-js";
import express, { query } from "express";
import path from "path";
import fs from "fs";

const test = require("./test")
require("dotenv").config();
global.fetch = fetch;

const app = express()
const port = 3000;
const visio = require("@google-cloud/vision");
//Pour notre methode post
const bodyParser = require('body-parser');

//Analyse
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

//configuration du client unsplash
const unsplash = createApi({accessKey: process.env.ACCESS_KEY_UNSPLASH || " "});

//configuration du client google cloud vision
const googleVision = new visio.ImageAnnotatorClient({keyFilename: "../ramdam-test-technique-375010-811bff750e21.json"});

//Cette variable contiendra toute nos images attendu pour ce projet
let linkResponseImage: string[] = [];

let labelResponseImage: string[] = [];


app.post('/api/unsplashclone', (req, res) => {

  //qui sera utiliser unsplash api
  const keyword = req.body.keyword;
  //l'API Google Cloud Vision
  const labelsForGCV: string[] = req.body.labels;

  //Demandons à unsplash API de nous fournir tous les images qui contient le mot clé keyword
unsplash.search.getPhotos({query: keyword, perPage: 30}).then(async result => {
  //Si Erreur
  if (result.errors)
    console.log('error occurred: ', result.errors[0]);
  //Si tout va bien
  else {
    //photos contient nos photo filtrer par notre client unsplash par query
    const photos = result.response;
      
      //On enregistre les données reçu dans un nouveau fichier .json juste pour le flow
      const newPhotosSaveFile = path.join(__dirname, "newPhotosSaveFile.json");
      fs.writeFileSync(newPhotosSaveFile, JSON.stringify(photos, null, 2));
  
   //Pour chaque photo, on vérifie si dans ses labels on y trouve l'ensemble des labels donnés dedans
   for(let i: number = 0; i<photos.results.length; i++){
    let cpt =0;
      //Demandons à Google Cloud vision de nous trouvers les images comportant tous ces tags (labels)
    await googleVision
            .labelDetection(photos.results[i].urls.raw)
            .then(async (results: { labelAnnotations: any; }[]) => {
              const labels = results[0].labelAnnotations;

              //si de par "labels" on arrive à retrouver un label de labelForGCV, on incremente cpt de 1
              await labels.forEach((label: { description: any; }) => labelsForGCV.map(l => l.toLowerCase()).includes(label.description.toLowerCase()) ? cpt++ : cpt = cpt );

             
             //console.log(cpt)
              
              //Si tous les labels se trouvent dans les labels d'un photo
             if(cpt === labelsForGCV.length){
                //Là on alimente dans ce cas notre tableau de label attendu à la fin
                for(let j: number = 0; j<labels.length; j++){
                  //là je pourais vérifier si un label n'est pas déjà présent avant de l'ajouter avec un if comme pour les lien juste si après
                  labelResponseImage.push(labels[j].description)
                }

                //Là on alimente notre tableau d'image si toutefois le meme lien n'est pas encore présent; ça m'est arrivé de voir le meme lien
                if(!linkResponseImage.includes(photos.results[i].urls.raw)){
                  linkResponseImage.push(photos.results[i].urls.raw)
                }

              
                    //Là on a juste enregistrer les labels obtenu dans un fichier pour voir
                    const newImageLabelFile = path.join(__dirname, "newImageLabelFile.json");
                    fs.writeFileSync(newImageLabelFile, JSON.stringify(labelResponseImage, null, 2));
                  
              }
          })   
      }
   
      //Pour le test de la réponse attendu
      res.json({
        "keyword": "city",
        "matches": [{
          "image_url": "http://localhost:3000/api/unsplashclone/urlImagesUnplash",
          "labels": labelResponseImage
        }]
      }) ; 
    }
  });
});

//Ce endpoint permet d'acceder à nos images finaux après le job de unsplash et GCV
app.get('/api/unsplashclone/urlImagesUnplash', (req, res) => {
   res.json(linkResponseImage);
})

app.listen(port, () => console.log(`Notre application Node est démarrée sur : http://localhost:${port}`))



/////////////////////////////////////////////////////////////////////////////////////////////////
                         
                                          "FOR_TEST_ON_LOCAL"

/////////////////////////////////////////////////////////////////////////////////////////////////
/*
//Demandons à unsplash API de nous fournir tous les images qui contient le mot clé keyword
unsplash.search.getPhotos({query: "city", perPage: 10}).then(async result => {
  //Si Erreur
  if (result.errors)
    console.log('error occurred: ', result.errors[0]);
  //Si tout va bien
  else {
    //photos contient nos photo filtrer par notre client unsplash par query
    const photos = result.response;

    //Ceci est notre liste de label à rechercher grace gcv à partir des photos trouvé par unsplash
    const labelsForGCV = ["Car", "Building"]
   
    //On enregistre les données reçu dans un nouveau fichier .json juste pour le flow
    const newPhotosSaveFile = path.join(__dirname, "newPhotosSaveFile.json");
    fs.writeFileSync(newPhotosSaveFile, JSON.stringify(photos, null, 2));
  
   //Pour chaque photo, on vérifie si dans ses labels on y trouve l'ensemble des labels donnés dedans
   for(let i: number = 0; i<photos.results.length; i++){
    let cpt =0;
      //Demandons à Google Cloud vision de nous trouvers les images comportant tous ces tags (labels)
    await googleVision
            .labelDetection(photos.results[i].urls.raw)
            .then(async (results: { labelAnnotations: any; }[]) => {
              const labels = results[0].labelAnnotations;

              //si de par "labels" on arrive à retrouver un label de labelForGCV, on incremente cpt de 1
             await labels.forEach((label: { description: any; }) => labelsForGCV.includes(label.description) ? cpt++ : cpt = cpt );
              //console.log(cpt)
              
              //Si tous les labels se trouvent dans les labels d'un photo
             if(cpt === labelsForGCV.length){
                //Là on alimente dans ce cas notre tableau de label attendu à la fin
                for(let j: number = 0; j<labels.length; j++){
                  labelResponseImage.push(labels[j].description)
                }

                //Là on alimente notre tableau d'image si toutefois le meme lien n'est pas encore présent; ça m'est arrivé de voir le meme lien
                if(!linkResponseImage.includes(photos.results[i].urls.raw)){
                  linkResponseImage.push(photos.results[i].urls.raw)
                }

                //Là on a juste enregistrer les labels obtenu dans un fichier pour voir
                const newImageLabelFile = path.join(__dirname, "newImageLabelFile.json");
                fs.writeFileSync(newImageLabelFile, JSON.stringify(labelResponseImage, null, 2));
             }
          })   
      }
   
      /*Pour le test de la réponse attendu
      On pourais essayer d'acceder à une valeur de "labelResponseImage" pour voir un label en réponse
      */
      /*
        console.log({
          "keyword": "city",
          "matches": [{
            "image_url": "http://localhost:3000/api/unsplashclone/urlImagesUnplash",
            "labels": labelResponseImage
          }]
        }) ; 
  }
});
*/


