# UnsplashAPI

## Développement d'une API REST basée sur le framework serveur ExpressJS en TypeScript. 

* L'objectif de cette API est d'exposer une route dans laquelle l'utilisateur peut saisir un
mot-clé pour trouver des images liées à ce mot-clé sur l'API_Unsplash. 
Cette route renvoie les labels trouvées sur les images renvoyées par Unsplash et l'url de ces images via l'API Google Cloud Vision .
____________________________________________________________________________________________________ 
 * Endpoint 
 
Method: POST
Path: /analyze
Body: {
  "keyword": "city",
  "labels": ["car", "building"]
}
_____________________________________________________________________________________________________
 * Response

{
"keyword": "city",
"matches": [{
  "image_url": "{{unsplash image URL}}",
  "labels": [
  "car",
  "building",
  "street",
  "people",
  "..."
  ]
  }]
 }
