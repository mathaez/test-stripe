const questions = [
  {
    text: "Quels adjectifs vous correspondent le mieux ?",
    options: [
      { text: "Rigoureux", type: "LG" },
      { text: "Inventif", type: "CD" },
      { text: "Spontané", type: "LD" },
      { text: "Logique", type: "CG" }
    ]
  },
  {
    text: "Quelles caractéristiques vous définissent ?",
    options: [
      { text: "Analytique", type: "CG" },
      { text: "Méthodique", type: "LG" },
      { text: "Créatif", type: "CD" },
      { text: "Communicatif", type: "LD" }
    ]
  },
  {
    text: "Comment réagissez-vous en groupe ?",
    options: [
      { text: "Réfléchi", type: "CG" },
      { text: "Visionnaire", type: "CD" },
      { text: "Empathique", type: "LD" },
      { text: "Structuré", type: "LG" }
    ]
  },
  {
    text: "Vos atouts personnels sont...",
    options: [
      { text: "Innovant", type: "CD" },
      { text: "Rationnel", type: "CG" },
      { text: "Intuitif", type: "LD" },
      { text: "Responsable", type: "LG" }
    ]
  },
  {
    text: "Quels traits vous décrivent ?",
    options: [
      { text: "Organisé", type: "LG" },
      { text: "Curieux", type: "CD" },
      { text: "Factuel", type: "CG" },
      { text: "Chaleureux", type: "LD" }
    ]
  },
  {
    text: "Comment prenez-vous des décisions ?",
    options: [
      { text: "Stable", type: "LG" },
      { text: "Audacieux", type: "CD" },
      { text: "Coopératif", type: "LD" },
      { text: "Cartésien", type: "CG" }
    ]
  },
  {
    text: "Comment gérez-vous les défis ?",
    options: [
      { text: "Structurant", type: "CG" },
      { text: "Flexible", type: "LD" },
      { text: "Pionnier", type: "CD" },
      { text: "Prévisible", type: "LG" }
    ]
  },
  {
    text: "Votre style de travail est...",
    options: [
      { text: "Sociable", type: "LD" },
      { text: "Théorique", type: "CG" },
      { text: "Créatif", type: "CD" },
      { text: "Discipliné", type: "LG" }
    ]
  },
  {
    text: "Face au stress, vous êtes plutôt...",
    options: [
      { text: "Excentrique", type: "CD" },
      { text: "Fiable", type: "LG" },
      { text: "À l'écoute", type: "LD" },
      { text: "Observateur", type: "CG" }
    ]
  },
  {
    text: "Dans un projet, vous êtes...",
    options: [
      { text: "Supportif", type: "LD" },
      { text: "Technique", type: "CG" },
      { text: "Imaginatif", type: "CD" },
      { text: "Rigoureux", type: "LG" }
    ]
  },
  {
    text: "Comment aimez-vous apprendre ?",
    options: [
      { text: "Émotionnel", type: "LD" },
      { text: "Préparé", type: "LG" },
      { text: "Méthodique", type: "CG" },
      { text: "Explorateur", type: "CD" }
    ]
  },
  {
    text: "Qu'est-ce qui vous motive ?",
    options: [
      { text: "Altruiste", type: "LD" },
      { text: "Concret", type: "CG" },
      { text: "Responsable", type: "LG" },
      { text: "Créatif", type: "CD" }
    ]
  },
  {
    text: "Vos relations sont guidées par...",
    options: [
      { text: "Original", type: "CD" },
      { text: "Indépendant", type: "CG" },
      { text: "Loyal", type: "LD" },
      { text: "Constant", type: "LG" }
    ]
  },
  {
    text: "Vous prenez des décisions en fonction de...",
    options: [
      { text: "Émotif", type: "LD" },
      { text: "Structuré", type: "LG" },
      { text: "Visionnaire", type: "CD" },
      { text: "Pragmatique", type: "CG" }
    ]
  },
  {
    text: "Ce qui vous rend confiant...",
    options: [
      { text: "Logique", type: "CG" },
      { text: "Initié", type: "CD" },
      { text: "Maîtrisé", type: "LG" },
      { text: "Bienveillant", type: "LD" }
    ]
  },
  {
    text: "Votre rapport à l'action est...",
    options: [
      { text: "Calculateur", type: "CG" },
      { text: "Spontané", type: "LD" },
      { text: "Inspiré", type: "CD" },
      { text: "Planificateur", type: "LG" }
    ]
  },
  {
    text: "Quand vous débutez un projet...",
    options: [
      { text: "Analytique", type: "CG" },
      { text: "Visionnaire", type: "CD" },
      { text: "Organisé", type: "LG" },
      { text: "Réceptif", type: "LD" }
    ]
  },
  {
    text: "Vous préférez les environnements...",
    options: [
      { text: "Stimulant", type: "CD" },
      { text: "Chaleureux", type: "LD" },
      { text: "Ordonné", type: "CG" },
      { text: "Sécurisé", type: "LG" }
    ]
  },
  {
    text: "Pour résoudre un conflit...",
    options: [
      { text: "Structuré", type: "LG" },
      { text: "Novateur", type: "CD" },
      { text: "Pacifique", type: "LD" },
      { text: "Factuel", type: "CG" }
    ]
  },
  {
    text: "Face à l'incertitude...",
    options: [
      { text: "Rationnel", type: "CG" },
      { text: "Expérimental", type: "CD" },
      { text: "Méthodique", type: "LG" },
      { text: "Intuitif", type: "LD" }
    ]
  },
  {
    text: "Dans une équipe idéale...",
    options: [
      { text: "Relationnel", type: "LD" },
      { text: "Analytique", type: "CG" },
      { text: "Créatif", type: "CD" },
      { text: "Structurant", type: "LG" }
    ]
  },
  {
    text: "Votre force principale est...",
    options: [
      { text: "Logique", type: "CG" },
      { text: "Fiable", type: "LG" },
      { text: "Imaginatif", type: "CD" },
      { text: "Empathique", type: "LD" }
    ]
  }
];