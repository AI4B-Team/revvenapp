import { useState, useEffect, useCallback } from 'react';

// Translation dictionaries for all supported languages
const translations: Record<string, Record<string, string>> = {
  en: {
    // Navigation
    'nav.create': 'Create',
    'nav.monetize': 'Monetize',
    'nav.automate': 'Automate',
    'nav.upgrade': 'Upgrade',
    'nav.earn': 'Earn',
    'nav.search': 'Search...',
    
    // Content Types
    'content.image': 'Image',
    'content.video': 'Video',
    'content.audio': 'Audio',
    'content.design': 'Design',
    'content.content': 'Content',
    'content.document': 'Document',
    'content.apps': 'Apps',
    
    // Common Actions
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.delete': 'Delete',
    'action.edit': 'Edit',
    'action.create': 'Create',
    'action.generate': 'Generate',
    'action.download': 'Download',
    'action.share': 'Share',
    'action.copy': 'Copy',
    'action.close': 'Close',
    'action.back': 'Back',
    'action.next': 'Next',
    'action.submit': 'Submit',
    'action.confirm': 'Confirm',
    'action.upload': 'Upload',
    'action.browse': 'Browse',
    'action.select': 'Select',
    'action.apply': 'Apply',
    'action.reset': 'Reset',
    'action.clear': 'Clear',
    'action.view': 'View',
    'action.preview': 'Preview',
    'action.publish': 'Publish',
    'action.schedule': 'Schedule',
    
    // Settings
    'settings.account': 'Account',
    'settings.subscription': 'Subscription',
    'settings.invites': 'Invites',
    'settings.integrations': 'Integrations',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.theme.system': 'System',
    'settings.addMembers': 'Add Members',
    
    // Calendar
    'calendar.today': 'Today',
    'calendar.week': 'Week',
    'calendar.month': 'Month',
    'calendar.scheduled': 'Scheduled',
    'calendar.draft': 'Draft',
    'calendar.published': 'Published',
    'calendar.more': 'more',
    'calendar.posts': 'posts',
    'calendar.noPosts': 'No posts scheduled',
    
    // Generation
    'generate.prompt': 'Enter your prompt...',
    'generate.generating': 'Generating...',
    'generate.success': 'Generated successfully!',
    'generate.error': 'Generation failed',
    'generate.enhance': 'Enhance prompt',
    
    // User
    'user.profile': 'Profile',
    'user.settings': 'Settings',
    'user.logout': 'Log out',
    'user.login': 'Log in',
    'user.signup': 'Sign up',
    
    // Messages
    'message.success': 'Success',
    'message.error': 'Error',
    'message.warning': 'Warning',
    'message.info': 'Information',
    'message.loading': 'Loading...',
    'message.noResults': 'No results found',
    'message.languageUpdated': 'Language Updated',
    'message.languageSetTo': 'Language set to',
    'message.themeUpdated': 'Theme Updated',
    'message.themeSetTo': 'Theme set to',
    
    // Help
    'help.title': 'Help & Support',
    'help.tutorials': 'Tutorials',
    'help.documentation': 'Documentation',
    'help.feedback': 'Send Feedback',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.whatsNew': "What's New",
    'notifications.inbox': 'Inbox',
    'notifications.markAllRead': 'Mark all as read',
    'notifications.noNotifications': 'No notifications',
    
    // Chat
    'chat.newChat': 'New Chat',
    'chat.recents': 'Recents',
    'chat.assistant': 'AI Assistant',
    
    // Sidebar
    'sidebar.dashboard': 'Dashboard',
    'sidebar.assets': 'Assets',
    'sidebar.templates': 'Templates',
    'sidebar.community': 'Community',
  },
  
  es: {
    // Navigation
    'nav.create': 'Crear',
    'nav.monetize': 'Monetizar',
    'nav.automate': 'Automatizar',
    'nav.upgrade': 'Mejorar',
    'nav.earn': 'Ganar',
    'nav.search': 'Buscar...',
    
    // Content Types
    'content.image': 'Imagen',
    'content.video': 'Video',
    'content.audio': 'Audio',
    'content.design': 'Diseño',
    'content.content': 'Contenido',
    'content.document': 'Documento',
    'content.apps': 'Aplicaciones',
    
    // Common Actions
    'action.save': 'Guardar',
    'action.cancel': 'Cancelar',
    'action.delete': 'Eliminar',
    'action.edit': 'Editar',
    'action.create': 'Crear',
    'action.generate': 'Generar',
    'action.download': 'Descargar',
    'action.share': 'Compartir',
    'action.copy': 'Copiar',
    'action.close': 'Cerrar',
    'action.back': 'Atrás',
    'action.next': 'Siguiente',
    'action.submit': 'Enviar',
    'action.confirm': 'Confirmar',
    'action.upload': 'Subir',
    'action.browse': 'Explorar',
    'action.select': 'Seleccionar',
    'action.apply': 'Aplicar',
    'action.reset': 'Restablecer',
    'action.clear': 'Limpiar',
    'action.view': 'Ver',
    'action.preview': 'Vista previa',
    'action.publish': 'Publicar',
    'action.schedule': 'Programar',
    
    // Settings
    'settings.account': 'Cuenta',
    'settings.subscription': 'Suscripción',
    'settings.invites': 'Invitaciones',
    'settings.integrations': 'Integraciones',
    'settings.language': 'Idioma',
    'settings.theme': 'Tema',
    'settings.theme.light': 'Claro',
    'settings.theme.dark': 'Oscuro',
    'settings.theme.system': 'Sistema',
    'settings.addMembers': 'Añadir Miembros',
    
    // Calendar
    'calendar.today': 'Hoy',
    'calendar.week': 'Semana',
    'calendar.month': 'Mes',
    'calendar.scheduled': 'Programado',
    'calendar.draft': 'Borrador',
    'calendar.published': 'Publicado',
    'calendar.more': 'más',
    'calendar.posts': 'publicaciones',
    'calendar.noPosts': 'No hay publicaciones programadas',
    
    // Generation
    'generate.prompt': 'Ingresa tu prompt...',
    'generate.generating': 'Generando...',
    'generate.success': '¡Generado exitosamente!',
    'generate.error': 'Error en la generación',
    'generate.enhance': 'Mejorar prompt',
    
    // User
    'user.profile': 'Perfil',
    'user.settings': 'Configuración',
    'user.logout': 'Cerrar sesión',
    'user.login': 'Iniciar sesión',
    'user.signup': 'Registrarse',
    
    // Messages
    'message.success': 'Éxito',
    'message.error': 'Error',
    'message.warning': 'Advertencia',
    'message.info': 'Información',
    'message.loading': 'Cargando...',
    'message.noResults': 'No se encontraron resultados',
    'message.languageUpdated': 'Idioma Actualizado',
    'message.languageSetTo': 'Idioma establecido a',
    'message.themeUpdated': 'Tema Actualizado',
    'message.themeSetTo': 'Tema establecido a',
    
    // Help
    'help.title': 'Ayuda y Soporte',
    'help.tutorials': 'Tutoriales',
    'help.documentation': 'Documentación',
    'help.feedback': 'Enviar Comentarios',
    
    // Notifications
    'notifications.title': 'Notificaciones',
    'notifications.whatsNew': 'Novedades',
    'notifications.inbox': 'Bandeja',
    'notifications.markAllRead': 'Marcar todo como leído',
    'notifications.noNotifications': 'Sin notificaciones',
    
    // Chat
    'chat.newChat': 'Nuevo Chat',
    'chat.recents': 'Recientes',
    'chat.assistant': 'Asistente IA',
    
    // Sidebar
    'sidebar.dashboard': 'Panel',
    'sidebar.assets': 'Recursos',
    'sidebar.templates': 'Plantillas',
    'sidebar.community': 'Comunidad',
  },
  
  fr: {
    // Navigation
    'nav.create': 'Créer',
    'nav.monetize': 'Monétiser',
    'nav.automate': 'Automatiser',
    'nav.upgrade': 'Améliorer',
    'nav.earn': 'Gagner',
    'nav.search': 'Rechercher...',
    
    // Content Types
    'content.image': 'Image',
    'content.video': 'Vidéo',
    'content.audio': 'Audio',
    'content.design': 'Design',
    'content.content': 'Contenu',
    'content.document': 'Document',
    'content.apps': 'Applications',
    
    // Common Actions
    'action.save': 'Sauvegarder',
    'action.cancel': 'Annuler',
    'action.delete': 'Supprimer',
    'action.edit': 'Modifier',
    'action.create': 'Créer',
    'action.generate': 'Générer',
    'action.download': 'Télécharger',
    'action.share': 'Partager',
    'action.copy': 'Copier',
    'action.close': 'Fermer',
    'action.back': 'Retour',
    'action.next': 'Suivant',
    'action.submit': 'Soumettre',
    'action.confirm': 'Confirmer',
    'action.upload': 'Téléverser',
    'action.browse': 'Parcourir',
    'action.select': 'Sélectionner',
    'action.apply': 'Appliquer',
    'action.reset': 'Réinitialiser',
    'action.clear': 'Effacer',
    'action.view': 'Voir',
    'action.preview': 'Aperçu',
    'action.publish': 'Publier',
    'action.schedule': 'Planifier',
    
    // Settings
    'settings.account': 'Compte',
    'settings.subscription': 'Abonnement',
    'settings.invites': 'Invitations',
    'settings.integrations': 'Intégrations',
    'settings.language': 'Langue',
    'settings.theme': 'Thème',
    'settings.theme.light': 'Clair',
    'settings.theme.dark': 'Sombre',
    'settings.theme.system': 'Système',
    'settings.addMembers': 'Ajouter des Membres',
    
    // Calendar
    'calendar.today': "Aujourd'hui",
    'calendar.week': 'Semaine',
    'calendar.month': 'Mois',
    'calendar.scheduled': 'Planifié',
    'calendar.draft': 'Brouillon',
    'calendar.published': 'Publié',
    'calendar.more': 'plus',
    'calendar.posts': 'publications',
    'calendar.noPosts': 'Aucune publication prévue',
    
    // Generation
    'generate.prompt': 'Entrez votre prompt...',
    'generate.generating': 'Génération en cours...',
    'generate.success': 'Généré avec succès!',
    'generate.error': 'Échec de la génération',
    'generate.enhance': 'Améliorer le prompt',
    
    // User
    'user.profile': 'Profil',
    'user.settings': 'Paramètres',
    'user.logout': 'Déconnexion',
    'user.login': 'Connexion',
    'user.signup': "S'inscrire",
    
    // Messages
    'message.success': 'Succès',
    'message.error': 'Erreur',
    'message.warning': 'Avertissement',
    'message.info': 'Information',
    'message.loading': 'Chargement...',
    'message.noResults': 'Aucun résultat trouvé',
    'message.languageUpdated': 'Langue Mise à Jour',
    'message.languageSetTo': 'Langue définie sur',
    'message.themeUpdated': 'Thème Mis à Jour',
    'message.themeSetTo': 'Thème défini sur',
    
    // Help
    'help.title': 'Aide et Support',
    'help.tutorials': 'Tutoriels',
    'help.documentation': 'Documentation',
    'help.feedback': 'Envoyer des Commentaires',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.whatsNew': 'Nouveautés',
    'notifications.inbox': 'Boîte de réception',
    'notifications.markAllRead': 'Tout marquer comme lu',
    'notifications.noNotifications': 'Pas de notifications',
    
    // Chat
    'chat.newChat': 'Nouveau Chat',
    'chat.recents': 'Récents',
    'chat.assistant': 'Assistant IA',
    
    // Sidebar
    'sidebar.dashboard': 'Tableau de Bord',
    'sidebar.assets': 'Ressources',
    'sidebar.templates': 'Modèles',
    'sidebar.community': 'Communauté',
  },
  
  de: {
    // Navigation
    'nav.create': 'Erstellen',
    'nav.monetize': 'Monetarisieren',
    'nav.automate': 'Automatisieren',
    'nav.upgrade': 'Upgraden',
    'nav.earn': 'Verdienen',
    'nav.search': 'Suchen...',
    
    // Content Types
    'content.image': 'Bild',
    'content.video': 'Video',
    'content.audio': 'Audio',
    'content.design': 'Design',
    'content.content': 'Inhalt',
    'content.document': 'Dokument',
    'content.apps': 'Apps',
    
    // Common Actions
    'action.save': 'Speichern',
    'action.cancel': 'Abbrechen',
    'action.delete': 'Löschen',
    'action.edit': 'Bearbeiten',
    'action.create': 'Erstellen',
    'action.generate': 'Generieren',
    'action.download': 'Herunterladen',
    'action.share': 'Teilen',
    'action.copy': 'Kopieren',
    'action.close': 'Schließen',
    'action.back': 'Zurück',
    'action.next': 'Weiter',
    'action.submit': 'Absenden',
    'action.confirm': 'Bestätigen',
    'action.upload': 'Hochladen',
    'action.browse': 'Durchsuchen',
    'action.select': 'Auswählen',
    'action.apply': 'Anwenden',
    'action.reset': 'Zurücksetzen',
    'action.clear': 'Löschen',
    'action.view': 'Ansehen',
    'action.preview': 'Vorschau',
    'action.publish': 'Veröffentlichen',
    'action.schedule': 'Planen',
    
    // Settings
    'settings.account': 'Konto',
    'settings.subscription': 'Abonnement',
    'settings.invites': 'Einladungen',
    'settings.integrations': 'Integrationen',
    'settings.language': 'Sprache',
    'settings.theme': 'Thema',
    'settings.theme.light': 'Hell',
    'settings.theme.dark': 'Dunkel',
    'settings.theme.system': 'System',
    'settings.addMembers': 'Mitglieder Hinzufügen',
    
    // Calendar
    'calendar.today': 'Heute',
    'calendar.week': 'Woche',
    'calendar.month': 'Monat',
    'calendar.scheduled': 'Geplant',
    'calendar.draft': 'Entwurf',
    'calendar.published': 'Veröffentlicht',
    'calendar.more': 'mehr',
    'calendar.posts': 'Beiträge',
    'calendar.noPosts': 'Keine Beiträge geplant',
    
    // Generation
    'generate.prompt': 'Geben Sie Ihren Prompt ein...',
    'generate.generating': 'Generierung...',
    'generate.success': 'Erfolgreich generiert!',
    'generate.error': 'Generierung fehlgeschlagen',
    'generate.enhance': 'Prompt verbessern',
    
    // User
    'user.profile': 'Profil',
    'user.settings': 'Einstellungen',
    'user.logout': 'Abmelden',
    'user.login': 'Anmelden',
    'user.signup': 'Registrieren',
    
    // Messages
    'message.success': 'Erfolg',
    'message.error': 'Fehler',
    'message.warning': 'Warnung',
    'message.info': 'Information',
    'message.loading': 'Laden...',
    'message.noResults': 'Keine Ergebnisse gefunden',
    'message.languageUpdated': 'Sprache Aktualisiert',
    'message.languageSetTo': 'Sprache eingestellt auf',
    'message.themeUpdated': 'Thema Aktualisiert',
    'message.themeSetTo': 'Thema eingestellt auf',
    
    // Help
    'help.title': 'Hilfe & Support',
    'help.tutorials': 'Tutorials',
    'help.documentation': 'Dokumentation',
    'help.feedback': 'Feedback Senden',
    
    // Notifications
    'notifications.title': 'Benachrichtigungen',
    'notifications.whatsNew': 'Neuigkeiten',
    'notifications.inbox': 'Posteingang',
    'notifications.markAllRead': 'Alle als gelesen markieren',
    'notifications.noNotifications': 'Keine Benachrichtigungen',
    
    // Chat
    'chat.newChat': 'Neuer Chat',
    'chat.recents': 'Kürzlich',
    'chat.assistant': 'KI-Assistent',
    
    // Sidebar
    'sidebar.dashboard': 'Dashboard',
    'sidebar.assets': 'Assets',
    'sidebar.templates': 'Vorlagen',
    'sidebar.community': 'Community',
  },
  
  pt: {
    // Navigation
    'nav.create': 'Criar',
    'nav.monetize': 'Monetizar',
    'nav.automate': 'Automatizar',
    'nav.upgrade': 'Atualizar',
    'nav.earn': 'Ganhar',
    'nav.search': 'Pesquisar...',
    
    // Content Types
    'content.image': 'Imagem',
    'content.video': 'Vídeo',
    'content.audio': 'Áudio',
    'content.design': 'Design',
    'content.content': 'Conteúdo',
    'content.document': 'Documento',
    'content.apps': 'Aplicativos',
    
    // Common Actions
    'action.save': 'Salvar',
    'action.cancel': 'Cancelar',
    'action.delete': 'Excluir',
    'action.edit': 'Editar',
    'action.create': 'Criar',
    'action.generate': 'Gerar',
    'action.download': 'Baixar',
    'action.share': 'Compartilhar',
    'action.copy': 'Copiar',
    'action.close': 'Fechar',
    'action.back': 'Voltar',
    'action.next': 'Próximo',
    'action.submit': 'Enviar',
    'action.confirm': 'Confirmar',
    'action.upload': 'Enviar',
    'action.browse': 'Navegar',
    'action.select': 'Selecionar',
    'action.apply': 'Aplicar',
    'action.reset': 'Redefinir',
    'action.clear': 'Limpar',
    'action.view': 'Visualizar',
    'action.preview': 'Pré-visualizar',
    'action.publish': 'Publicar',
    'action.schedule': 'Agendar',
    
    // Settings
    'settings.account': 'Conta',
    'settings.subscription': 'Assinatura',
    'settings.invites': 'Convites',
    'settings.integrations': 'Integrações',
    'settings.language': 'Idioma',
    'settings.theme': 'Tema',
    'settings.theme.light': 'Claro',
    'settings.theme.dark': 'Escuro',
    'settings.theme.system': 'Sistema',
    'settings.addMembers': 'Adicionar Membros',
    
    // Calendar
    'calendar.today': 'Hoje',
    'calendar.week': 'Semana',
    'calendar.month': 'Mês',
    'calendar.scheduled': 'Agendado',
    'calendar.draft': 'Rascunho',
    'calendar.published': 'Publicado',
    'calendar.more': 'mais',
    'calendar.posts': 'publicações',
    'calendar.noPosts': 'Nenhuma publicação agendada',
    
    // Generation
    'generate.prompt': 'Digite seu prompt...',
    'generate.generating': 'Gerando...',
    'generate.success': 'Gerado com sucesso!',
    'generate.error': 'Falha na geração',
    'generate.enhance': 'Melhorar prompt',
    
    // User
    'user.profile': 'Perfil',
    'user.settings': 'Configurações',
    'user.logout': 'Sair',
    'user.login': 'Entrar',
    'user.signup': 'Cadastrar',
    
    // Messages
    'message.success': 'Sucesso',
    'message.error': 'Erro',
    'message.warning': 'Aviso',
    'message.info': 'Informação',
    'message.loading': 'Carregando...',
    'message.noResults': 'Nenhum resultado encontrado',
    'message.languageUpdated': 'Idioma Atualizado',
    'message.languageSetTo': 'Idioma definido para',
    'message.themeUpdated': 'Tema Atualizado',
    'message.themeSetTo': 'Tema definido para',
    
    // Help
    'help.title': 'Ajuda e Suporte',
    'help.tutorials': 'Tutoriais',
    'help.documentation': 'Documentação',
    'help.feedback': 'Enviar Feedback',
    
    // Notifications
    'notifications.title': 'Notificações',
    'notifications.whatsNew': 'Novidades',
    'notifications.inbox': 'Caixa de Entrada',
    'notifications.markAllRead': 'Marcar tudo como lido',
    'notifications.noNotifications': 'Sem notificações',
    
    // Chat
    'chat.newChat': 'Novo Chat',
    'chat.recents': 'Recentes',
    'chat.assistant': 'Assistente IA',
    
    // Sidebar
    'sidebar.dashboard': 'Painel',
    'sidebar.assets': 'Recursos',
    'sidebar.templates': 'Modelos',
    'sidebar.community': 'Comunidade',
  },
};

// Get current language from localStorage
const getStoredLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('app-language') || 'en';
  }
  return 'en';
};

// Custom hook for translations
export const useTranslation = () => {
  const [language, setLanguageState] = useState(getStoredLanguage);

  // Listen for language changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = localStorage.getItem('app-language') || 'en';
      setLanguageState(newLang);
    };

    // Listen for storage events (from other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event for same-tab updates
    window.addEventListener('languageChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('languageChange', handleStorageChange);
    };
  }, []);

  // Translation function
  const t = useCallback((key: string, fallback?: string): string => {
    const langTranslations = translations[language] || translations.en;
    return langTranslations[key] || fallback || key;
  }, [language]);

  // Set language function
  const setLanguage = useCallback((lang: string) => {
    localStorage.setItem('app-language', lang);
    setLanguageState(lang);
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('languageChange'));
  }, []);

  return { t, language, setLanguage };
};

// Export translations for direct access if needed
export { translations };
