import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { addInscriptionIfNotExists } from './googleSheetsService.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
// Route d'inscription
app.post('/api/inscription', async (req, res) => {
  const { nom, prenom, email, age, sex, adresse, telephone, soeurs, freres, rang, statut, classe, profession, niveau_etude, etude_professionnelle } = req.body;
  // Vérification des champs obligatoires
  if (
    !nom || !prenom || !age || !sex || !adresse || !telephone ||
    soeurs === undefined || freres === undefined || rang === undefined || !statut ||
    (statut === 'Etudiant' && (!niveau_etude || (niveau_etude !== 'Préscolaire' && !classe))) ||
    (statut === 'Travailleur' && !profession) ||
    (statut === 'EtudeProfessionnelle' && !etude_professionnelle)
  ) {
    return res.status(400).json({ message: 'Fenoy avokoa azafady ireo saha rehetra tsy maintsy fenoina.' });
  }
  // Vérification du format de l'email s'il est renseigné
  if (email && !/^[^@\s]+@gmail\.com$/.test(email.trim())) {
    return res.status(400).json({ message: 'Azafady, ampidiro mailaka @gmail.com manankery.' });
  }
  try {
    const result = await addInscriptionIfNotExists(req.body);
    if (result === 'exists') {
      return res.status(409).json({ message: 'Efa nandefa fangatahana ianao.' });
    }
    return res.status(201).json({ message: 'Voaray soa aman-tsara ny fangatahanao ary miandry fanamarinana.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Miala tsiny indrindra, misy olana kely.' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
}); 
