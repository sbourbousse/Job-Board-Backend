var express = require('express');
var mysql = require('mysql');
var cors = require('cors')
const port = process.env.PORT || 3000;
var app = express();

app.use(cors());

var bodyParser = require('body-parser');
const { query } = require('express');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

var connection = mysql.createConnection({
  host     : 'mysql-supergap.alwaysdata.net',
  user     : 'supergap_jobboar',
  password : 'jobBoard123',
  database : 'supergap_jobboard'
});

function successResponseParser(data) {
  return {
    success: true,
    data : data
  };
}

function errorResponseParser(errorMessage) {
  return {
    success: false,
    errorMessage : errorMessage,
    data : null
  };
}
// Récupèrer toutes les offres d'emploi
app.get('/jobs', function(req, res) {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Content-Type', 'application/json');

    sql='SELECT Entreprises.nom, Entreprises.ville, Entreprises.codePostal, Entreprises.rue, Entreprises.site, Entreprises.siret, Annonces.idAnnonce, Annonces.titre, Annonces.contenue, Annonces.date, Annonces.salaire, Annonces.tauxHoraire, Annonces.place '+
    'FROM Annonces inner join Personnes on Annonces.idPersonne=Personnes.idPersonne inner join Entreprises on Personnes.idEntreprise=Entreprises.idEntreprise '+
    'WHERE etat=true';
    console.log(sql);
    connection.query(sql, function (err, rows, fields) {
      res.send(successResponseParser(rows));
    });

});

// Récupèrer une offre d'emploi
app.get('/jobs/:id', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Content-Type', 'application/json');

  sql = 'SELECT Entreprises.nom, Entreprises.ville, Entreprises.codePostal, Entreprises.rue, Entreprises.site, Entreprises.siret, Annonces.idAnnonce, Annonces.titre, Annonces.contenue, Annonces.date, Annonces.salaire, Annonces.tauxHoraire, Annonces.place '+
  'FROM Annonces inner join Personnes on Annonces.idPersonne=Personnes.idPersonne inner join Entreprises on Personnes.idEntreprise=Entreprises.idEntreprise '+
  'WHERE etat=true AND idAnnonce='+req.params.id;
  console.log(sql);

  connection.query(sql, function(err, rows, fields) {
    res.send(successResponseParser(rows[0]));
  });
});

//Créer une offre d'emploi
app.post('/jobs', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Content-Type', 'application/json');
  uniqueId = new Date().getTime();
  sql = 'INSERT INTO Annonces (idAnnonce,idPersonne,titre,contenue,date,salaire,tauxHoraire,place,etat) VALUES '+'('+String(new Date().getTime()-1601457047128)+','+req.body.idPersonne+',"'+req.body.titre+'","'+req.body.contenue+'","'+req.body.date+'",'+req.body.salaire+','+req.body.tauxHoraire+',"'+req.body.place+'",true)';
  console.log(sql);
  connection.query(sql, function(err, rows) {
    res.send();
  });
});

//Supprimer une offre d'emploi
app.delete('/jobs/:id', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Content-Type', 'application/json');
  uniqueId = new Date().getTime();
  sql = 'DELETE FROM Annonces WHERE idAnnonce='+req.params.id;
  console.log(sql);
  connection.query(sql, function(err, rows) {
    res.send();
  });
});

//Modifier une offre d'emploi
app.put('/jobs/:id', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Content-Type', 'application/json');
  sql = "UPDATE Annonces SET "
  for(var key in req.body) {
    if(req.body.hasOwnProperty(key)){
      sql += key+" = \""+req.body[key]+"\", ";
    }
  }
  sql = sql.slice(0, -2) + " WHERE idAnnonce="+req.params.id;

  connection.query(sql, function(err, rows) {
    res.send(sql);
  });
});

app.post('/apply/', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Content-Type', 'application/json');

  if (!req.body.idPersonne && req.body.mail) {
    sql = 'SELECT idPersonne FROM Personnes WHERE mail="'+req.body.mail+'"';

    connection.query(sql, function(err, rows, fields) {
      idPersonne = Object.values(rows[0]).toString();
      currentDate = new Date().getFullYear().toString()+"-"+new Date().getMonth()+"-"+new Date().getDay()+" "+new Date().getHours()+":"+new Date().getMinutes()+":"+new Date().getSeconds();
      sql = "INSERT INTO Informations (idPersonne, idAnnonce, message, date) VALUES "+
      "("+idPersonne+","+req.body.idAnnonce+",\""+req.body.message+"\",\""+currentDate+"\")";
      connection.query(sql, function(err, rows) {
        if(err) res.send(errorResponseParser(err.toString()));
        else res.send(successResponseParser({}));
      });
    });

  } else if (req.body.idPersonne) {
    idPersonne = req.body.idPersonne;
    currentDate = new Date().getFullYear().toString()+"-"+new Date().getMonth()+"-"+new Date().getDay()+" "+new Date().getHours()+":"+new Date().getMinutes()+":"+new Date().getSeconds();
    sql = "INSERT INTO Informations (idPersonne, idAnnonce, message, date) VALUES "+
    "("+req.body.idPersonne+","+req.body.idAnnonce+",\""+req.body.message+"\",\""+currentDate+"\")";
    connection.query(sql, function(err, rows) {
      if(err) res.send(errorResponseParser(err.toString()));
      else res.send(successResponseParser({}));
    });
  }
});

app.post('/user/', function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Content-Type', 'application/json');
    //Vérifier que l'ont recoi un identifiant unique de l'utilisateur
    if (req.body.mail) {
      //Vérifier que l'identifiant existe
      sql = 'SELECT mail FROM Personnes WHERE mail="'+req.body.mail+'"';
      connection.query(sql, function(err, rows) {
        if(rows[0]) {
          //Si l'utilisateur existe - modifier l'utilisateur
          sql = "UPDATE Personnes SET "
          for(var key in req.body) {
            if(req.body.hasOwnProperty(key)){
              sql += key+" = \""+req.body[key]+"\", ";
            }
          }
          sql = sql.slice(0, -2) + ' WHERE mail="'+req.body.mail+'" OR idPersonne="'+req.body.idPersonne+'"';        
          connection.query(sql, function(err, rows) {
            if(err) res.send(errorResponseParser(err.toString()));
            else res.send(successResponseParser({}));
          });
        } else {
          uniqueId=String(new Date().getTime()-1601457047002);
          //Si l'utilisateur n'existe pas - créer l'utilisateur
          sql = "INSERT INTO Personnes (idPersonne, nom, prenom, mail) VALUES "+
          "("+uniqueId+",\""+req.body.nom+"\",\""+req.body.prenom+"\",\""+req.body.mail+"\")";
          console.log(sql);
          connection.query(sql, function(err, rows) {
            if(err) res.send(errorResponseParser(err.toString()));
            else res.send(successResponseParser({}));
          });
        }
      });
    } else {
      res.send(errorResponseParser("Données non conforme"))
    }
});

//Mise a jour de données utilisateur - TODO répétition , code améliorable
app.put('/user/', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Content-Type', 'application/json');

  sql = 'SELECT idPersonne, identifiant FROM Personnes WHERE identifiant = "' + req.body.identifiant + '";';
  connection.query(sql, function(err, rows) {
    //Si l'identifiant choisi est pris
    if (rows[0] != null) {
      //L'identifiant est pris par lui meme
      if((req.body.identifiant == rows[0].identifiant && req.body.idPersonne == rows[0].idPersonne) || rows[0] == null)
      {
        if(req.body.motDePasse != "") //Mot de passe inchangé
        {
          sql = 'UPDATE Personnes SET identifiant = "' + req.body.identifiant + '", sexe = "' + req.body.sexe + '", mail = "' + req.body.mail + '", telephone = "' + req.body.telephone +'" WHERE idPersonne = "' + req.body.idPersonne + '";';
          console.log(sql);
          connection.query(sql, function(err, rows) {
            res.send(successResponseParser());
          });
        }
        else //mot de passe modifié
        {
          sql = 'UPDATE Personnes SET identifiant = "' + req.body.identifiant + '" motDePasse = "' + req.body.motDePasse + '", nom = "' + req.body.nom + '", prenom = "' + req.body.prenom + '", sexe = "' + req.body.sexe + '", mail = "' + req.body.mail + '", telephone = "' + req.body.telephone +'" WHERE idPersonne = "' + req.body.idPersonne + '";';
          console.log(sql);
          connection.query(sql, function(err, rows) {
            res.send(successResponseParser());
          });
        }
      }
      //Par quelqu'un d'autre 
      else if(req.body.identifiant == rows[0].identifiant && req.body.idPersonne != rows[0].idPersonne) {
        res.send(errorResponseParser("L'identifiant est déjà utiliser."));
      }
    }
    // L'identifiant choisie est libre 
    else {
      if(req.body.motDePasse != "") //Mot de passe inchangé
      {
        sql = 'UPDATE Personnes SET identifiant = "' + req.body.identifiant + '", sexe = "' + req.body.sexe + '", mail = "' + req.body.mail + '", telephone = "' + req.body.telephone +'" WHERE idPersonne = "' + req.body.idPersonne + '";';
        console.log(sql);
        connection.query(sql, function(err, rows) {
          res.send(successResponseParser());
        });
      }
      else //mot de passe modifié
      {
        sql = 'UPDATE Personnes SET identifiant = "' + req.body.identifiant + '" motDePasse = "' + req.body.motDePasse + '", nom = "' + req.body.nom + '", prenom = "' + req.body.prenom + '", sexe = "' + req.body.sexe + '", mail = "' + req.body.mail + '", telephone = "' + req.body.telephone +'" WHERE idPersonne = "' + req.body.idPersonne + '";';
        console.log(sql);
        connection.query(sql, function(err, rows) {
          res.send(successResponseParser());
        });
      }
    }
  });
});

//Inscrition au site
app.post('/signup/', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Content-Type', 'application/json');

  sql = 'SELECT COUNT(*) as count FROM Personnes WHERE identifiant = "' + req.body.identifiant + '";';
  connection.query(sql, function(err, rows) {
  if(rows[0].count == 0)
  {
    sql = 'SELECT * FROM Personnes WHERE nom = "' + req.body.nom + '" AND prenom = "' + req.body.prenom + '" AND mail = "' + req.body.mail + '" AND telephone = "' + req.body.telephone + '";';
    connection.query(sql, function(err, rows) {
      if( !rows[0] )
      {
        //Si l'utilisateur n'a pas postuler pour une annonce
        uniqueId=String(new Date().getTime()-1601457047002);
        connection .query(sql, function (err, rows){
          sql = 'INSERT INTO Personnes (idPersonne, idEntreprise, identifiant, motDePasse, nom, prenom, mail, telephone, sexe) VALUES ("' + uniqueId + '",NULL,"' + req.body.identifiant + '","' + req.body.motDePasse + '","' + req.body.nom + '","' +  req.body.prenom + '","' + req.body.mail + '","' + req.body.telephone + '","' + req.body.sexe + '");';
          connection.query(sql, function(err, rows) {
            res.send(successResponseParser());
          });
        });
      }
      else
      {
        connection .query(sql, function (err, rows){
          //Si l'utilisateur a déja postuler pour une annonce
          sql = 'SELECT identifiant, motDepasse, sexe FROM Personnes WHERE mail = "' + req.body.mail + '", telephone = "' + req.body.telephone + '" AND identifiant;';
          connection.query(sql, function(err, rows) {
            if(!rows)
            {
              connection .query(sql, function (err, rows){
                //Si l'utilisateur a déja postuler pour une annonce modification de ces paramétres
                sql = 'UPDATE Personnes SET identifiant = "' + req.body.identifiant + '", motDePasse = "' + req.body.motDePasse + '", sexe = "' + req.body.sexe + '" WHERE mail = "' + req.body.mail + '" AND telephoen = "' + req.body.telephone +'";';
                connection.query(sql, function(err, rows) {
                  res.send(successResponseParser());
                });
              });
            }
          });
        }); 
      }
    });
  }
  else
  {
    res.send(errorResponseParser("Cette identifiant est déjà utilisé."));
  }
  }); 
}); 

//Connexion au site
app.post('/login/', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Content-Type', 'application/json');

  if(req.body.identifiant && req.body.motDePasse)
  {
    let sql = 'SELECT Personnes.idPersonne, Personnes.identifiant, Personnes.nom, Personnes.prenom, Personnes.mail, Personnes.telephone, Entreprises.nom as entreprisenom, Personnes.sexe, Personnes.administrateur FROM Personnes LEFT JOIN Entreprises on Personnes.idEntreprise = Entreprises.idEntreprise WHERE identifiant = "' + req.body.identifiant + '" AND motDePasse = "' + req.body.motDePasse + '";';
    connection.query(sql, function(err, rows) {
      if( rows[0] == null )
      { 
        //L'utilisateur n'existe pas
        res.send(errorResponseParser("L'utilisateur n'existe pas."));
      }
      else
      {
        const user = rows[0];
        let token = "";
        for(let i = 0; i < 3; i++)
        {
          token += Math.random().toString(36);
        }
        token = token.slice(0, -2);


        sql = 'UPDATE Personnes set token="'+ token + '" WHERE identifiant="' + req.body.identifiant + '";';
        connection.query(sql, function(err, rows) {
          if(!err){
            user.token = token;
            res.send(successResponseParser(user));
          }
          else
            res.send(errorResponseParser("Le token n'a pus être crée"));
        })
      }
    })
  }
  else
  {
    sql = 'SELECT Personnes.idPersonne, Personnes.identifiant, Personnes.nom, Personnes.prenom, Personnes.mail, Personnes.telephone, Entreprises.nom as entreprisenom, Personnes.sexe, Personnes.administrateur FROM Personnes LEFT JOIN Entreprises on Personnes.idEntreprise = Entreprises.idEntreprise WHERE token = "' + req.body.token + '";';
    console.log(sql);
    connection.query(sql, function(err, rows) {
      if(!err)
        res.send(successResponseParser());
      else
        res.send(errorResponseParser("Le token n'a pus être crée"));
    })
  }
});

//Récuperation d'une table
app.get('/panel/:nomTable', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Content-Type', 'application/json');

  
  let sql = "SELECT * FROM " + req.params.nomTable + ";";
  console.log(sql);

  connection.query(sql, function(err, rows) {
    if(!err)
      res.send(successResponseParser(rows));
    else {
      if(!err)
        res.send(errorResponseParser("La données n'ont pus être récupérer"));
      else
        res.send(errorResponseParser("La table n'existe pas"));
    }
  });
});

//Mise a jour de données dans une table
app.put('/panel/:nomTable', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Content-Type', 'application/json');

  
  let sql = "UPDATE " + req.params.nomTable + " SET";
  let longueurBody = Object.keys(req.body).length;
  let nomIdTable = ('id' + req.params.nomTable).slice(0,-1);
  console.log(nomIdTable);
  
  if(req.body[nomIdTable] != "id"){
  for (const prop in req.body) {
    if(prop != nomIdTable)
    sql += ' ' + prop + '= "' + req.body[prop] + '",';
  }
  sql = sql.slice(0,-1);
  sql += ' WHERE ' + nomIdTable +  '= "' + req.body[nomIdTable] + '";';

  connection.query(sql, function(err, rows) {
    if(!err && rows.changedRows == 1)
      res.send({complete : rows});
    else {
      if(err)
        res.send({error : "La mise a jour n'a pu etre effectuer"});
      else
        res.send({error : "La table n'existe pas"});
    }
  });
  }
});

//Ajout de valeur dans une table
app.post('/panel/:nomTable', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Content-Type', 'application/json');

  let uniqueId=String(new Date().getTime()-1601457047002);
  let currentDate = new Date().getFullYear().toString()+"-"+new Date().getMonth()+"-"+new Date().getDay()+" "+new Date().getHours()+":"+new Date().getMinutes()+":"+new Date().getSeconds();
  let sql = "INSERT INTO " + req.params.nomTable + " ";
  let colonnes = '(';
  let value = " VALUES(";
  let nomIdTable = ('id' + req.params.nomTable).slice(0,-1);

  if(req.body[nomIdTable] != "id"){
  for (const prop in req.body) {
    if(prop == nomIdTable) {
      colonnes += nomIdTable + ', ';
      value += '"' + uniqueId + '", ';
    }
    if(prop == "date") {
      colonnes += prop + ', ';
      value += '"' + currentDate + '", ';
    }
    if(prop != nomIdTable) {
      colonnes += prop + ', ';
      value += '"' + req.body[prop] + '", ';
    }
  }
  colonnes = colonnes.slice(0,-2);
  colonnes += ') ';

  value = value.slice(0,-2);
  value += ');';

  sql += colonnes + value;

  console.log(sql);

  connection.query(sql, function(err, rows) {
    if(!err && rows.changedRows == 1)
      res.send({complete : "Mise a jour effectuer"});
    else {
      if(err)
        res.send({error : "La mise a jour n'a pu etre effectuer"});
      else
        res.send({error : "La table n'existe pas"});
    }
  });
  }
});

// Suppresion d'une ligne d'une table
app.delete('/panel/:nomTable', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Content-Type', 'application/json');
  
  let nomIdTable = ('id' + req.params.nomTable).slice(0,-1);
  let sql = 'DELETE FROM ' + req.params.nomTable + ' WHERE ' + nomIdTable + '= "' + req.body[nomIdTable] + '";';

  connection.query(sql, function(err, rows) {
    if(!err)
      res.send({complete : "Les données ont bien était supprimer"});
    else {
      if(err)
        res.send({error : "La données n'ont pus être supprimer"});
      else
        res.send({error : "La table n'existe pas"});
    }
  });
});

app.listen(port, () => console.log(`Listening on ${port}`));
