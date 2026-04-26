import type { MajorityCategoryId } from '../../navigation/types';

export type MajorityQuestion = {
  id: string;
  category: MajorityCategoryId;
  question: string;
  options: string[];
};

export const majorityCategoryOptions: MajorityCategoryId[] = [
  'comida',
  'gustos',
  'peliculas-series',
  'musica',
  'random',
  'amigos'
];

export const majorityQuestions: MajorityQuestion[] = [
  { id: 'comida-1', category: 'comida', question: '¿Pizza o sushi?', options: ['Pizza', 'Sushi'] },
  { id: 'comida-2', category: 'comida', question: '¿Tacos o hamburguesa?', options: ['Tacos', 'Hamburguesa'] },
  { id: 'comida-3', category: 'comida', question: '¿Dulce o salado?', options: ['Dulce', 'Salado'] },
  { id: 'comida-4', category: 'comida', question: '¿Cafe o te?', options: ['Cafe', 'Te'] },
  { id: 'gustos-1', category: 'gustos', question: '¿Playa o montaña?', options: ['Playa', 'Montaña'] },
  { id: 'gustos-2', category: 'gustos', question: '¿Dia o noche?', options: ['Dia', 'Noche'] },
  { id: 'gustos-3', category: 'gustos', question: '¿Perros o gatos?', options: ['Perros', 'Gatos'] },
  { id: 'gustos-4', category: 'gustos', question: '¿Salir o quedarse?', options: ['Salir', 'Quedarse'] },
  { id: 'peliculas-1', category: 'peliculas-series', question: '¿Marvel o DC?', options: ['Marvel', 'DC'] },
  { id: 'peliculas-2', category: 'peliculas-series', question: '¿Comedia o terror?', options: ['Comedia', 'Terror'] },
  { id: 'peliculas-3', category: 'peliculas-series', question: '¿Series o peliculas?', options: ['Series', 'Peliculas'] },
  { id: 'peliculas-4', category: 'peliculas-series', question: '¿Netflix o cine?', options: ['Netflix', 'Cine'] },
  { id: 'musica-1', category: 'musica', question: '¿Pop o rock?', options: ['Pop', 'Rock'] },
  { id: 'musica-2', category: 'musica', question: '¿Reggaeton o regional?', options: ['Reggaeton', 'Regional'] },
  { id: 'musica-3', category: 'musica', question: '¿Playlist o album?', options: ['Playlist', 'Album'] },
  { id: 'musica-4', category: 'musica', question: '¿Concierto o festival?', options: ['Concierto', 'Festival'] },
  { id: 'random-1', category: 'random', question: '¿Viajar al pasado o futuro?', options: ['Pasado', 'Futuro'] },
  { id: 'random-2', category: 'random', question: '¿Volar o teletransportarte?', options: ['Volar', 'Teletransportarme'] },
  { id: 'random-3', category: 'random', question: '¿Invisible o superfuerte?', options: ['Invisible', 'Superfuerte'] },
  { id: 'random-4', category: 'random', question: '¿Risa o drama?', options: ['Risa', 'Drama'] },
  { id: 'amigos-1', category: 'amigos', question: '¿Plan tranquilo o fiesta?', options: ['Tranquilo', 'Fiesta'] },
  { id: 'amigos-2', category: 'amigos', question: '¿Chat o llamada?', options: ['Chat', 'Llamada'] },
  { id: 'amigos-3', category: 'amigos', question: '¿Organizado o espontaneo?', options: ['Organizado', 'Espontaneo'] },
  { id: 'amigos-4', category: 'amigos', question: '¿Broma interna o foto grupal?', options: ['Broma', 'Foto'] }
];
