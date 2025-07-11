import { google } from 'googleapis';

const SPREADSHEET_ID = '1fHfzEpyee_2fZL-g_-lO4AD6IKMZ8OU1V6JoIKf7B38'; // À remplacer par l'ID de ton Google Sheet
const SHEET_NAME = 'Feuille 1'; // À adapter si besoin

async function getAuth() {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes,
  });
  return auth.getClient();
}

export async function addInscriptionIfNotExists(data) {
  const client = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth: client });
  // Récupérer toutes les inscriptions
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:Z`,
  });
  const rows = response.data.values || [];
  // Vérifier unicité nom + prénom + téléphone
  if (rows.some(row => {
    const nom = row[0] ? row[0].toLowerCase().trim() : '';
    const prenom = row[1] ? row[1].toLowerCase().trim() : '';
    const telephone = row[6] ? row[6].toLowerCase().trim() : '';
    return (
      nom === data.nom.toLowerCase().trim() &&
      prenom === data.prenom.toLowerCase().trim() &&
      telephone === data.telephone.toLowerCase().trim()
    );
  })) {
    return 'exists';
  }
  // Ajouter la nouvelle inscription (ordre des champs)
  const now = new Date().toLocaleString('fr-FR');
  const newRow = [
    data.nom,
    data.prenom,
    data.email,
    data.age,
    data.sex,
    data.adresse,
    data.telephone,
    data.facebook,
    data.maladie,
    data.medicaments,
    data.aliments,
    data.soeurs,
    data.freres,
    data.rang,
    data.statut,
    data.niveau_etude,
    data.classe,
    data.profession,
    data.etude_professionnelle,
    data.reve,
    data.deteste,
    data.hobbies,
    'en attente',
    now
  ];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [newRow],
    },
  });
  return 'added';
} 