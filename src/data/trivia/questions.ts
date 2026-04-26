import type { TriviaTopicId } from '../../navigation/types';

export type TriviaQuestion = {
  id: string;
  topic: TriviaTopicId;
  question: string;
  answer: string;
  aliases?: string[];
};

export const triviaTopicOptions: TriviaTopicId[] = [
  'famosos',
  'f1',
  'cultura-general',
  'marcas',
  'personajes-ficticios',
  'objetos'
];

export const triviaQuestions: TriviaQuestion[] = [
  { id: 'famosos-1', topic: 'famosos', question: 'Cantante mexicano conocido como El Divo de Juarez.', answer: 'Juan Gabriel', aliases: ['Juanga'] },
  { id: 'famosos-2', topic: 'famosos', question: 'Cantante colombiana de Hips Don’t Lie.', answer: 'Shakira' },
  { id: 'famosos-3', topic: 'famosos', question: 'Artista puertorriqueno de Un Verano Sin Ti.', answer: 'Bad Bunny' },
  { id: 'famosos-4', topic: 'famosos', question: 'Cantante de Thriller y Billie Jean.', answer: 'Michael Jackson', aliases: ['MJ'] },
  { id: 'f1-1', topic: 'f1', question: 'Piloto mexicano conocido como Checo.', answer: 'Sergio Perez', aliases: ['Checo Perez', 'Perez'] },
  { id: 'f1-2', topic: 'f1', question: 'Equipo rojo historico de Formula 1.', answer: 'Ferrari', aliases: ['Scuderia Ferrari'] },
  { id: 'f1-3', topic: 'f1', question: 'Piloto neerlandes campeon con Red Bull.', answer: 'Max Verstappen', aliases: ['Verstappen'] },
  { id: 'f1-4', topic: 'f1', question: 'Circuito famoso de Monaco.', answer: 'Monaco', aliases: ['Monte Carlo'] },
  { id: 'cultura-1', topic: 'cultura-general', question: 'Planeta conocido como el planeta rojo.', answer: 'Marte' },
  { id: 'cultura-2', topic: 'cultura-general', question: 'Capital de Japon.', answer: 'Tokio', aliases: ['Tokyo'] },
  { id: 'cultura-3', topic: 'cultura-general', question: 'Oceano mas grande del mundo.', answer: 'Pacifico', aliases: ['Oceano Pacifico'] },
  { id: 'cultura-4', topic: 'cultura-general', question: 'Autor de Don Quijote.', answer: 'Miguel de Cervantes', aliases: ['Cervantes'] },
  { id: 'marcas-1', topic: 'marcas', question: 'Marca de la manzana mordida.', answer: 'Apple' },
  { id: 'marcas-2', topic: 'marcas', question: 'Marca deportiva con el swoosh.', answer: 'Nike' },
  { id: 'marcas-3', topic: 'marcas', question: 'Refresco famoso de color rojo.', answer: 'Coca-Cola', aliases: ['Coca Cola'] },
  { id: 'marcas-4', topic: 'marcas', question: 'Marca de autos electricos de Elon Musk.', answer: 'Tesla' },
  { id: 'ficcion-1', topic: 'personajes-ficticios', question: 'Heroe que vive en Ciudad Gotica.', answer: 'Batman', aliases: ['Bruce Wayne'] },
  { id: 'ficcion-2', topic: 'personajes-ficticios', question: 'Plomero de Nintendo con gorra roja.', answer: 'Mario', aliases: ['Mario Bros'] },
  { id: 'ficcion-3', topic: 'personajes-ficticios', question: 'Saiyajin protagonista de Dragon Ball.', answer: 'Goku', aliases: ['Son Goku'] },
  { id: 'ficcion-4', topic: 'personajes-ficticios', question: 'Princesa de hielo de Frozen.', answer: 'Elsa' },
  { id: 'objetos-1', topic: 'objetos', question: 'Objeto para abrir una puerta.', answer: 'Llave' },
  { id: 'objetos-2', topic: 'objetos', question: 'Objeto para escribir en papel.', answer: 'Lapiz', aliases: ['Lápiz'] },
  { id: 'objetos-3', topic: 'objetos', question: 'Objeto que marca la hora.', answer: 'Reloj' },
  { id: 'objetos-4', topic: 'objetos', question: 'Objeto para protegerse de la lluvia.', answer: 'Paraguas' }
];
