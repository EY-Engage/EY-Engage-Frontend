const fs = require('fs');
const path = require('path');

const pagesJson = {
  "auth": {
    "login": "app/auth/page.tsx"
  },
  "front-office": {
    "dashboard": "app/front-office/page.tsx",
    "events": {
      "list": "app/front-office/events/page.tsx",
      "details": "app/front-office/events/[id]/page.tsx"
    },
    "notifications": "app/front-office/notifications/page.tsx",
    "social": {
      "feed": "app/front-office/social/page.tsx",
      "post": "app/front-office/social/post/page.tsx"
    },
    "messages": "app/front-office/messages/page.tsx"
  },
  "back-office": {
    "dashboard": "app/back-office/page.tsx",
    "users": "app/back-office/users/page.tsx",
    "events": {
      "manage": "app/back-office/events/manage/page.tsx",
      "analytics": "app/back-office/events/analytics/page.tsx"
    },
    "notifications": "app/back-office/notifications/page.tsx",
    "social-moderation": "app/back-office/social/moderation/page.tsx",
    "messages": "app/back-office/messages/page.tsx"
  }
};

// Fonction récursive pour créer les fichiers
const createFiles = (structure, basePath = './src') => {
  Object.entries(structure).forEach(([key, value]) => {
    if (typeof value === 'string') {
      const filePath = path.join(basePath, value);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, `export default function Page() { return <div>${key} Page</div>; }`);
    } else {
      createFiles(value, basePath);
    }
  });
};

// Exécuter le script
createFiles(pagesJson);
console.log("✅ Pages et composants générés avec succès !");
