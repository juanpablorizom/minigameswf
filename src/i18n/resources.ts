export const resources = {
  es: {
    translation: {
      common: {
        back: 'Atrás',
        account: 'Cuenta',
        games: 'Juegos',
        settings: 'Ajustes',
        loading: 'Cargando'
      },
      auth: {
        badge: 'JUNTADA',
        eyebrow: 'Noche social de juegos',
        title: 'Entra a la juntada y deja lista tu cuenta.',
        subtitle:
          'Usa tu correo para iniciar sesión o crear cuenta. El acceso queda listo para móvil y web con la misma base.',
        primaryCardTitle: 'Acceso',
        primaryCardCopy: 'Esta base ya usa autenticación real con Supabase y persistencia de sesión.',
        displayNamePlaceholder: 'Cómo te verá tu grupo',
        emailPlaceholder: 'tu-correo@ejemplo.com',
        passwordPlaceholder: 'Tu contraseña',
        signIn: 'Iniciar sesión',
        signUp: 'Crear cuenta',
        continueAsGuest: 'Entrar como invitado',
        guestHint: 'Puedes entrar rápido sin cuenta y vincularla después desde la pestaña de Cuenta.',
        continueBlockTitle: 'Base real de cuenta',
        continueBlockCopy: 'Perfil, idioma, cierre de sesión y punto de entrada para vincular cuenta.',
        supabaseMissing: 'Faltan variables de entorno de Supabase. Configúralas para activar el acceso real.',
        signUpSuccess: 'Cuenta creada. Si tu proyecto exige confirmación por correo, revisa tu inbox antes de entrar.'
      },
      account: {
        title: 'Cuenta',
        subtitle: 'Revisa tu perfil, estado de cuenta y la base de tu plan.',
        profileSection: 'Perfil actual',
        displayName: 'Nombre visible',
        username: 'Usuario',
        email: 'Correo',
        accountState: 'Estado de cuenta',
        accountStateGuest: 'Invitado',
        accountStateAuthenticated: 'Autenticado',
        accountDetails: 'Datos de cuenta',
        missingUsername: 'Todavía no tienes un usuario visible.',
        linkedAccounts: 'Cuenta vinculada',
        linkedAccountsEmpty: 'No hay una cuenta adicional vinculada todavía.',
        linkedAccountsHint: 'El flujo queda preparado, pero requiere credenciales reales del proveedor para completarse.',
        linkAccount: 'Vincular cuenta',
        linkedAccountsGuestHint: 'Estás jugando como invitado. Vincula una cuenta cuando quieras guardar identidad y acceso.',
        guestPrimaryLink: 'Vincular cuenta para guardar acceso',
        billingSection: 'Planes y pagos',
        currentPlan: 'Plan actual',
        currentPlanEmpty: 'Todavía no hay una suscripción o plan conectado.',
        billingHint: 'La estructura queda lista para billing y upgrades cuando el backend de pagos esté disponible.',
        billingCta: 'Administrar plan y pagos',
        dataSection: 'Datos disponibles',
        missingDisplayName: 'Todavía no definiste un nombre visible.',
        missingEmail: 'Tu proveedor no expuso un correo.',
        linkingRequiresSetup: 'Hace falta configurar el proveedor en Supabase antes de completar la vinculación.',
        linkingGuestEntry: 'La entrada para vincular cuenta ya está prevista, pero todavía necesita el proveedor real.',
        billingNotReady: 'La gestión real de pagos y plan queda preparada, pero todavía no está conectada.',
        notConfigured: 'Supabase no está configurado todavía.',
        savingLanguage: 'Guardando idioma...'
      },
      settings: {
        title: 'Ajustes',
        subtitle: 'Controla idioma, dirección visual y tu sesión.',
        language: 'Idioma',
        spanish: 'Español',
        english: 'Inglés',
        theme: 'Sistema de color',
        themeHint: 'La selección queda guardada desde ahora. La aplicación completa adoptará la expansión visual en el siguiente pase.',
        logout: 'Cerrar sesión',
        appearanceSection: 'Apariencia',
        sessionSection: 'Sesión',
        savingTheme: 'Guardando tema...'
      },
      navigation: {
        accountCta: 'Cuenta',
        accountTab: 'Cuenta',
        gamesTab: 'Juegos',
        settingsTab: 'Ajustes'
      }
    }
  },
  en: {
    translation: {
      common: {
        back: 'Back',
        account: 'Account',
        games: 'Games',
        settings: 'Settings',
        loading: 'Loading'
      },
      auth: {
        badge: 'JUNTADA',
        eyebrow: 'Social game night',
        title: 'Join the hangout and set up your account.',
        subtitle:
          'Use your email to sign in or create an account. The same foundation is ready for mobile and web.',
        primaryCardTitle: 'Access',
        primaryCardCopy: 'This foundation already uses real Supabase auth and persistent sessions.',
        displayNamePlaceholder: 'How your group will see you',
        emailPlaceholder: 'your-email@example.com',
        passwordPlaceholder: 'Your password',
        signIn: 'Sign in',
        signUp: 'Create account',
        continueAsGuest: 'Continue as guest',
        guestHint: 'You can enter quickly without an account and link it later from the Account tab.',
        continueBlockTitle: 'Real account foundation',
        continueBlockCopy: 'Profile, language, logout, and an account-linking entry point.',
        supabaseMissing: 'Supabase environment variables are missing. Configure them to enable real sign-in.',
        signUpSuccess: 'Account created. If your project requires email confirmation, check your inbox before signing in.'
      },
      account: {
        title: 'Account',
        subtitle: 'Review your profile, account state, and plan foundation.',
        profileSection: 'Current profile',
        displayName: 'Display name',
        username: 'Username',
        email: 'Email',
        accountState: 'Account state',
        accountStateGuest: 'Guest',
        accountStateAuthenticated: 'Authenticated',
        accountDetails: 'Account details',
        missingUsername: 'You do not have a visible username yet.',
        linkedAccounts: 'Linked account',
        linkedAccountsEmpty: 'No additional linked account yet.',
        linkedAccountsHint: 'The flow is scaffolded, but it still needs real provider credentials to complete.',
        linkAccount: 'Link account',
        linkedAccountsGuestHint: 'You are playing as a guest. Link an account whenever you want to save identity and access.',
        guestPrimaryLink: 'Link account to save access',
        billingSection: 'Plans and payments',
        currentPlan: 'Current plan',
        currentPlanEmpty: 'No connected subscription or plan yet.',
        billingHint: 'The UI structure is ready for billing and upgrades once the payments backend exists.',
        billingCta: 'Manage plan and billing',
        dataSection: 'Available data',
        missingDisplayName: 'You have not set a display name yet.',
        missingEmail: 'Your provider did not expose an email.',
        linkingRequiresSetup: 'You still need to configure the provider in Supabase before account linking can complete.',
        linkingGuestEntry: 'The account-linking entry point is ready, but it still needs the real provider setup.',
        billingNotReady: 'Real billing and plan management are scaffolded, but not connected yet.',
        notConfigured: 'Supabase is not configured yet.',
        savingLanguage: 'Saving language...'
      },
      settings: {
        title: 'Settings',
        subtitle: 'Control language, visual direction, and your session.',
        language: 'Language',
        spanish: 'Spanish',
        english: 'English',
        theme: 'Color system',
        themeHint: 'The choice is already saved. The full app will adopt the broader visual expansion in the next pass.',
        logout: 'Log out',
        appearanceSection: 'Appearance',
        sessionSection: 'Session',
        savingTheme: 'Saving theme...'
      },
      navigation: {
        accountCta: 'Account',
        accountTab: 'Account',
        gamesTab: 'Games',
        settingsTab: 'Settings'
      }
    }
  }
} as const;
