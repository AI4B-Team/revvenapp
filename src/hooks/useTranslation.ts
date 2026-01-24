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
    'content.apps': 'App',
    
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
    
    // Auth/Login Page
    'auth.login': 'Login',
    'auth.signUp': 'Sign Up',
    'auth.signIn': 'Sign In',
    'auth.welcome': 'Welcome',
    'auth.createAccount': 'Create Account',
    'auth.pleaseEnterDetails': 'Please Enter Your Details',
    'auth.startAutomating': 'Start Automating Your Business In Under 10 Minutes',
    'auth.fullName': 'Full Name',
    'auth.enterEmail': 'Enter Email',
    'auth.enterPassword': 'Enter Password',
    'auth.exclusiveInviteCode': 'Exclusive Invite Code',
    'auth.required': 'Required',
    'auth.enterInviteCode': 'ENTER YOUR INVITE CODE',
    'auth.accessByInvitation': 'Access Is By Invitation Only',
    'auth.noCodeJoinWaitlist': 'No Code? Join Waitlist',
    'auth.emailNotFound': 'Email Not Found,',
    'auth.joinUs': 'Join Us',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.loading': 'Loading...',
    'auth.or': 'OR',
    'auth.signInWithGoogle': 'Sign In With Google',
    'auth.alreadyHaveAccount': 'Already Have An Account?',
    'auth.dontHaveAccount': "Don't Have An Account?",
    'auth.createYourAccount': 'Create Your Account',
    'auth.byContinuing': 'By continuing, you agree to our',
    'auth.termsOfService': 'Terms of Service',
    'auth.and': '&',
    'auth.privacyPolicy': 'Privacy Policy',
    'auth.alreadyLoggedIn': 'You are already logged in',
    'auth.logOut': 'Log Out',
    'auth.searchLanguages': 'Search Languages...',
    'auth.noLanguagesFound': 'No languages found',
    
    // Password Strength
    'password.weak': 'Weak',
    'password.medium': 'Medium',
    'password.strong': 'Strong',
    'password.weakPassword': 'Weak Password',
    'password.mediumPassword': 'Medium Password',
    'password.strongPassword': 'Strong Password',
    'password.mustInclude': 'Password Must Include:',
    'password.atLeast8Chars': 'At Least 8 Characters',
    'password.upperLowerCase': 'Upper & Lower Case Letters',
    'password.aSymbol': 'A Symbol (#$&)',
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
    
    // Auth/Login Page
    'auth.login': 'Iniciar Sesión',
    'auth.signUp': 'Registrarse',
    'auth.signIn': 'Iniciar Sesión',
    'auth.welcome': 'Bienvenido',
    'auth.createAccount': 'Crear Cuenta',
    'auth.pleaseEnterDetails': 'Por Favor Ingresa Tus Datos',
    'auth.startAutomating': 'Comienza a Automatizar Tu Negocio En Menos de 10 Minutos',
    'auth.fullName': 'Nombre Completo',
    'auth.enterEmail': 'Ingresa Email',
    'auth.enterPassword': 'Ingresa Contraseña',
    'auth.exclusiveInviteCode': 'Código de Invitación Exclusivo',
    'auth.required': 'Requerido',
    'auth.enterInviteCode': 'INGRESA TU CÓDIGO DE INVITACIÓN',
    'auth.accessByInvitation': 'El Acceso Es Solo Por Invitación',
    'auth.noCodeJoinWaitlist': '¿Sin Código? Únete a la Lista de Espera',
    'auth.emailNotFound': 'Email No Encontrado,',
    'auth.joinUs': 'Únete',
    'auth.forgotPassword': '¿Olvidaste Tu Contraseña?',
    'auth.loading': 'Cargando...',
    'auth.or': 'O',
    'auth.signInWithGoogle': 'Iniciar Sesión Con Google',
    'auth.alreadyHaveAccount': '¿Ya Tienes Una Cuenta?',
    'auth.dontHaveAccount': '¿No Tienes Cuenta?',
    'auth.createYourAccount': 'Crea Tu Cuenta',
    'auth.byContinuing': 'Al continuar, aceptas nuestros',
    'auth.termsOfService': 'Términos de Servicio',
    'auth.and': 'y',
    'auth.privacyPolicy': 'Política de Privacidad',
    'auth.alreadyLoggedIn': 'Ya has iniciado sesión',
    'auth.logOut': 'Cerrar Sesión',
    'auth.searchLanguages': 'Buscar Idiomas...',
    'auth.noLanguagesFound': 'No se encontraron idiomas',
    
    // Password Strength
    'password.weak': 'Débil',
    'password.medium': 'Media',
    'password.strong': 'Fuerte',
    'password.weakPassword': 'Contraseña Débil',
    'password.mediumPassword': 'Contraseña Media',
    'password.strongPassword': 'Contraseña Fuerte',
    'password.mustInclude': 'La Contraseña Debe Incluir:',
    'password.atLeast8Chars': 'Al Menos 8 Caracteres',
    'password.upperLowerCase': 'Letras Mayúsculas y Minúsculas',
    'password.aSymbol': 'Un Símbolo (#$&)',
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
    
    // Auth/Login Page
    'auth.login': 'Connexion',
    'auth.signUp': "S'inscrire",
    'auth.signIn': 'Se Connecter',
    'auth.welcome': 'Bienvenue',
    'auth.createAccount': 'Créer un Compte',
    'auth.pleaseEnterDetails': 'Veuillez Entrer Vos Informations',
    'auth.startAutomating': 'Commencez à Automatiser Votre Entreprise En Moins de 10 Minutes',
    'auth.fullName': 'Nom Complet',
    'auth.enterEmail': 'Entrer Email',
    'auth.enterPassword': 'Entrer Mot de Passe',
    'auth.exclusiveInviteCode': "Code d'Invitation Exclusif",
    'auth.required': 'Requis',
    'auth.enterInviteCode': "ENTREZ VOTRE CODE D'INVITATION",
    'auth.accessByInvitation': "L'Accès Est Sur Invitation Uniquement",
    'auth.noCodeJoinWaitlist': "Pas de Code? Rejoignez la Liste d'Attente",
    'auth.emailNotFound': 'Email Non Trouvé,',
    'auth.joinUs': 'Rejoignez-nous',
    'auth.forgotPassword': 'Mot de Passe Oublié?',
    'auth.loading': 'Chargement...',
    'auth.or': 'OU',
    'auth.signInWithGoogle': 'Se Connecter Avec Google',
    'auth.alreadyHaveAccount': 'Vous Avez Déjà un Compte?',
    'auth.dontHaveAccount': "Vous N'avez Pas de Compte?",
    'auth.createYourAccount': 'Créez Votre Compte',
    'auth.byContinuing': 'En continuant, vous acceptez nos',
    'auth.termsOfService': "Conditions d'Utilisation",
    'auth.and': 'et',
    'auth.privacyPolicy': 'Politique de Confidentialité',
    'auth.alreadyLoggedIn': 'Vous êtes déjà connecté',
    'auth.logOut': 'Déconnexion',
    'auth.searchLanguages': 'Rechercher des Langues...',
    'auth.noLanguagesFound': 'Aucune langue trouvée',
    
    // Password Strength
    'password.weak': 'Faible',
    'password.medium': 'Moyen',
    'password.strong': 'Fort',
    'password.weakPassword': 'Mot de Passe Faible',
    'password.mediumPassword': 'Mot de Passe Moyen',
    'password.strongPassword': 'Mot de Passe Fort',
    'password.mustInclude': 'Le Mot de Passe Doit Inclure:',
    'password.atLeast8Chars': 'Au Moins 8 Caractères',
    'password.upperLowerCase': 'Lettres Majuscules et Minuscules',
    'password.aSymbol': 'Un Symbole (#$&)',
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
    'content.apps': 'App',
    
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
    
    // Auth/Login Page
    'auth.login': 'Anmelden',
    'auth.signUp': 'Registrieren',
    'auth.signIn': 'Anmelden',
    'auth.welcome': 'Willkommen',
    'auth.createAccount': 'Konto Erstellen',
    'auth.pleaseEnterDetails': 'Bitte Geben Sie Ihre Daten Ein',
    'auth.startAutomating': 'Automatisieren Sie Ihr Geschäft In Unter 10 Minuten',
    'auth.fullName': 'Vollständiger Name',
    'auth.enterEmail': 'Email Eingeben',
    'auth.enterPassword': 'Passwort Eingeben',
    'auth.exclusiveInviteCode': 'Exklusiver Einladungscode',
    'auth.required': 'Erforderlich',
    'auth.enterInviteCode': 'GEBEN SIE IHREN EINLADUNGSCODE EIN',
    'auth.accessByInvitation': 'Zugang Nur Auf Einladung',
    'auth.noCodeJoinWaitlist': 'Kein Code? Warteliste Beitreten',
    'auth.emailNotFound': 'Email Nicht Gefunden,',
    'auth.joinUs': 'Mitmachen',
    'auth.forgotPassword': 'Passwort Vergessen?',
    'auth.loading': 'Laden...',
    'auth.or': 'ODER',
    'auth.signInWithGoogle': 'Mit Google Anmelden',
    'auth.alreadyHaveAccount': 'Haben Sie Bereits Ein Konto?',
    'auth.dontHaveAccount': 'Kein Konto?',
    'auth.createYourAccount': 'Erstellen Sie Ihr Konto',
    'auth.byContinuing': 'Mit dem Fortfahren stimmen Sie unseren',
    'auth.termsOfService': 'Nutzungsbedingungen',
    'auth.and': 'und',
    'auth.privacyPolicy': 'Datenschutzrichtlinie',
    'auth.alreadyLoggedIn': 'Sie sind bereits angemeldet',
    'auth.logOut': 'Abmelden',
    'auth.searchLanguages': 'Sprachen Suchen...',
    'auth.noLanguagesFound': 'Keine Sprachen gefunden',
    
    // Password Strength
    'password.weak': 'Schwach',
    'password.medium': 'Mittel',
    'password.strong': 'Stark',
    'password.weakPassword': 'Schwaches Passwort',
    'password.mediumPassword': 'Mittleres Passwort',
    'password.strongPassword': 'Starkes Passwort',
    'password.mustInclude': 'Passwort Muss Enthalten:',
    'password.atLeast8Chars': 'Mindestens 8 Zeichen',
    'password.upperLowerCase': 'Groß- und Kleinbuchstaben',
    'password.aSymbol': 'Ein Symbol (#$&)',
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
    
    // Auth/Login Page
    'auth.login': 'Entrar',
    'auth.signUp': 'Cadastrar',
    'auth.signIn': 'Entrar',
    'auth.welcome': 'Bem-vindo',
    'auth.createAccount': 'Criar Conta',
    'auth.pleaseEnterDetails': 'Por Favor Insira Seus Dados',
    'auth.startAutomating': 'Comece a Automatizar Seu Negócio Em Menos de 10 Minutos',
    'auth.fullName': 'Nome Completo',
    'auth.enterEmail': 'Digite Email',
    'auth.enterPassword': 'Digite Senha',
    'auth.exclusiveInviteCode': 'Código de Convite Exclusivo',
    'auth.required': 'Obrigatório',
    'auth.enterInviteCode': 'DIGITE SEU CÓDIGO DE CONVITE',
    'auth.accessByInvitation': 'O Acesso É Apenas Por Convite',
    'auth.noCodeJoinWaitlist': 'Sem Código? Junte-se à Lista de Espera',
    'auth.emailNotFound': 'Email Não Encontrado,',
    'auth.joinUs': 'Junte-se',
    'auth.forgotPassword': 'Esqueceu a Senha?',
    'auth.loading': 'Carregando...',
    'auth.or': 'OU',
    'auth.signInWithGoogle': 'Entrar Com Google',
    'auth.alreadyHaveAccount': 'Já Tem Uma Conta?',
    'auth.dontHaveAccount': 'Não Tem Conta?',
    'auth.createYourAccount': 'Crie Sua Conta',
    'auth.byContinuing': 'Ao continuar, você concorda com nossos',
    'auth.termsOfService': 'Termos de Serviço',
    'auth.and': 'e',
    'auth.privacyPolicy': 'Política de Privacidade',
    'auth.alreadyLoggedIn': 'Você já está logado',
    'auth.logOut': 'Sair',
    'auth.searchLanguages': 'Buscar Idiomas...',
    'auth.noLanguagesFound': 'Nenhum idioma encontrado',
    
    // Password Strength
    'password.weak': 'Fraca',
    'password.medium': 'Média',
    'password.strong': 'Forte',
    'password.weakPassword': 'Senha Fraca',
    'password.mediumPassword': 'Senha Média',
    'password.strongPassword': 'Senha Forte',
    'password.mustInclude': 'A Senha Deve Incluir:',
    'password.atLeast8Chars': 'Pelo Menos 8 Caracteres',
    'password.upperLowerCase': 'Letras Maiúsculas e Minúsculas',
    'password.aSymbol': 'Um Símbolo (#$&)',
  },
  
  bn: {
    // Navigation
    'nav.create': 'তৈরি করুন',
    'nav.monetize': 'আয় করুন',
    'nav.automate': 'স্বয়ংক্রিয়',
    'nav.upgrade': 'আপগ্রেড',
    'nav.earn': 'উপার্জন',
    'nav.search': 'অনুসন্ধান...',
    
    // Content Types
    'content.image': 'ছবি',
    'content.video': 'ভিডিও',
    'content.audio': 'অডিও',
    'content.design': 'ডিজাইন',
    'content.content': 'কন্টেন্ট',
    'content.document': 'ডকুমেন্ট',
    'content.apps': 'অ্যাপস',
    
    // Common Actions
    'action.save': 'সংরক্ষণ',
    'action.cancel': 'বাতিল',
    'action.delete': 'মুছুন',
    'action.edit': 'সম্পাদনা',
    'action.create': 'তৈরি করুন',
    'action.generate': 'জেনারেট',
    'action.download': 'ডাউনলোড',
    'action.share': 'শেয়ার',
    'action.copy': 'কপি',
    'action.close': 'বন্ধ',
    'action.back': 'পিছনে',
    'action.next': 'পরবর্তী',
    'action.submit': 'জমা দিন',
    'action.confirm': 'নিশ্চিত করুন',
    'action.upload': 'আপলোড',
    'action.browse': 'ব্রাউজ',
    'action.select': 'নির্বাচন',
    'action.apply': 'প্রয়োগ',
    'action.reset': 'রিসেট',
    'action.clear': 'পরিষ্কার',
    'action.view': 'দেখুন',
    'action.preview': 'প্রিভিউ',
    'action.publish': 'প্রকাশ',
    'action.schedule': 'সময়সূচি',
    
    // Settings
    'settings.account': 'অ্যাকাউন্ট',
    'settings.subscription': 'সাবস্ক্রিপশন',
    'settings.invites': 'আমন্ত্রণ',
    'settings.integrations': 'ইন্টিগ্রেশন',
    'settings.language': 'ভাষা',
    'settings.theme': 'থিম',
    'settings.theme.light': 'হালকা',
    'settings.theme.dark': 'গাঢ়',
    'settings.theme.system': 'সিস্টেম',
    'settings.addMembers': 'সদস্য যোগ করুন',
    
    // Calendar
    'calendar.today': 'আজ',
    'calendar.week': 'সপ্তাহ',
    'calendar.month': 'মাস',
    'calendar.scheduled': 'নির্ধারিত',
    'calendar.draft': 'খসড়া',
    'calendar.published': 'প্রকাশিত',
    'calendar.more': 'আরও',
    'calendar.posts': 'পোস্ট',
    'calendar.noPosts': 'কোন পোস্ট নির্ধারিত নেই',
    
    // Generation
    'generate.prompt': 'আপনার প্রম্পট লিখুন...',
    'generate.generating': 'জেনারেট হচ্ছে...',
    'generate.success': 'সফলভাবে জেনারেট হয়েছে!',
    'generate.error': 'জেনারেশন ব্যর্থ',
    'generate.enhance': 'প্রম্পট উন্নত করুন',
    
    // User
    'user.profile': 'প্রোফাইল',
    'user.settings': 'সেটিংস',
    'user.logout': 'লগ আউট',
    'user.login': 'লগ ইন',
    'user.signup': 'সাইন আপ',
    
    // Messages
    'message.success': 'সফল',
    'message.error': 'ত্রুটি',
    'message.warning': 'সতর্কতা',
    'message.info': 'তথ্য',
    'message.loading': 'লোড হচ্ছে...',
    'message.noResults': 'কোন ফলাফল পাওয়া যায়নি',
    'message.languageUpdated': 'ভাষা আপডেট হয়েছে',
    'message.languageSetTo': 'ভাষা সেট করা হয়েছে',
    'message.themeUpdated': 'থিম আপডেট হয়েছে',
    'message.themeSetTo': 'থিম সেট করা হয়েছে',
    
    // Help
    'help.title': 'সাহায্য ও সহায়তা',
    'help.tutorials': 'টিউটোরিয়াল',
    'help.documentation': 'ডকুমেন্টেশন',
    'help.feedback': 'মতামত পাঠান',
    
    // Notifications
    'notifications.title': 'বিজ্ঞপ্তি',
    'notifications.whatsNew': 'নতুন কী',
    'notifications.inbox': 'ইনবক্স',
    'notifications.markAllRead': 'সব পঠিত হিসেবে চিহ্নিত করুন',
    'notifications.noNotifications': 'কোন বিজ্ঞপ্তি নেই',
    
    // Chat
    'chat.newChat': 'নতুন চ্যাট',
    'chat.recents': 'সাম্প্রতিক',
    'chat.assistant': 'এআই সহকারী',
    
    // Sidebar
    'sidebar.dashboard': 'ড্যাশবোর্ড',
    'sidebar.assets': 'অ্যাসেট',
    'sidebar.templates': 'টেমপ্লেট',
    'sidebar.community': 'কমিউনিটি',
    
    // Auth/Login Page
    'auth.login': 'লগইন',
    'auth.signUp': 'সাইন আপ',
    'auth.signIn': 'সাইন ইন',
    'auth.welcome': 'স্বাগতম',
    'auth.createAccount': 'অ্যাকাউন্ট তৈরি করুন',
    'auth.pleaseEnterDetails': 'অনুগ্রহ করে আপনার তথ্য দিন',
    'auth.startAutomating': '১০ মিনিটের কম সময়ে আপনার ব্যবসা স্বয়ংক্রিয় করুন',
    'auth.fullName': 'পুরো নাম',
    'auth.enterEmail': 'ইমেইল লিখুন',
    'auth.enterPassword': 'পাসওয়ার্ড লিখুন',
    'auth.exclusiveInviteCode': 'এক্সক্লুসিভ আমন্ত্রণ কোড',
    'auth.required': 'প্রয়োজনীয়',
    'auth.enterInviteCode': 'আপনার আমন্ত্রণ কোড লিখুন',
    'auth.accessByInvitation': 'প্রবেশ শুধুমাত্র আমন্ত্রণে',
    'auth.noCodeJoinWaitlist': 'কোড নেই? অপেক্ষার তালিকায় যোগ দিন',
    'auth.emailNotFound': 'ইমেইল পাওয়া যায়নি,',
    'auth.joinUs': 'যোগ দিন',
    'auth.forgotPassword': 'পাসওয়ার্ড ভুলে গেছেন?',
    'auth.loading': 'লোড হচ্ছে...',
    'auth.or': 'অথবা',
    'auth.signInWithGoogle': 'গুগল দিয়ে সাইন ইন করুন',
    'auth.alreadyHaveAccount': 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে?',
    'auth.dontHaveAccount': 'অ্যাকাউন্ট নেই?',
    'auth.createYourAccount': 'আপনার অ্যাকাউন্ট তৈরি করুন',
    'auth.byContinuing': 'চালিয়ে যেতে, আপনি আমাদের সম্মত হন',
    'auth.termsOfService': 'সেবার শর্তাবলী',
    'auth.and': 'এবং',
    'auth.privacyPolicy': 'গোপনীয়তা নীতি',
    'auth.alreadyLoggedIn': 'আপনি ইতিমধ্যে লগইন করেছেন',
    'auth.logOut': 'লগ আউট',
    'auth.searchLanguages': 'ভাষা খুঁজুন...',
    'auth.noLanguagesFound': 'কোন ভাষা পাওয়া যায়নি',
    
    // Password Strength
    'password.weak': 'দুর্বল',
    'password.medium': 'মাঝারি',
    'password.strong': 'শক্তিশালী',
    'password.weakPassword': 'দুর্বল পাসওয়ার্ড',
    'password.mediumPassword': 'মাঝারি পাসওয়ার্ড',
    'password.strongPassword': 'শক্তিশালী পাসওয়ার্ড',
    'password.mustInclude': 'পাসওয়ার্ডে থাকতে হবে:',
    'password.atLeast8Chars': 'কমপক্ষে ৮টি অক্ষর',
    'password.upperLowerCase': 'বড় ও ছোট হাতের অক্ষর',
    'password.aSymbol': 'একটি চিহ্ন (#$&)',
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
