# Administration et sécurité

## Accès

Le propriétaire doit pouvoir accéder à `/login` et `/admin`, mais aucun inconnu ne doit pouvoir créer un compte administrateur. Sur le starter kit officiel, vérifier si l'inscription utilisateur est activée, et la désactiver pour un portfolio monopersonnel. Ne **jamais** supprimer les protections CSRF, désactiver les tests d'autorisation ou mettre des secrets en dur.

Créer une Gate `access-admin` fondée sur un champ d'administrateur ou une permission appropriée. Attacher `auth` ET `can:access-admin` à la totalité des routes privées et des actions. Ajouter Policies aux mutations par ressource lorsque nécessaire. Contrôler côté serveur les uploads, downloads privés, messages et suppressions ; les contraintes d'affichage React n'établissent jamais l'autorisation.

## CRUD

Chaque écran d'administration doit avoir : liste lisible, recherche si volume utile, création, édition, suppression avec confirmation, erreurs sous les champs, retour de succès, aperçu éventuel, statut brouillon/publié. Éviter les modales difficiles à utiliser sur mobile. Séparer `FormRequest`, Controller, service si logique complexe, et composants React de formulaire.

## Uploads

Valider type réel, extension, poids, dimensions si image ; choisir stockage public uniquement pour fichiers destinés au public (images, CV). Générer des chemins non devinables pour données privées. Ne pas accepter d'exécutables, SVG non filtrés ou fichiers arbitraires comme images. Nettoyer les fichiers orphelins avec prudence. Prévoir une image alternative et texte `alt`.

## Contact

Valider email, longueur des messages et anti-spam/honeypot + limitation de débit. Afficher un message de confirmation sans divulguer les détails internes. Envoyer un mail uniquement après configuration SMTP sûre ; en absence de SMTP, enregistrer la demande en DB et documenter le comportement. Protéger la lecture des messages dans l'admin ; limiter leur conservation aux besoins réels.

## Tests essentiels

- Un anonyme est renvoyé à l'authentification pour `/admin`.
- Un utilisateur authentifié mais non-admin reçoit un refus 403 pour toutes les mutations et lectures privées.
- Une requête de modification invalide échoue avec erreurs appropriées.
- Un projet brouillon ne paraît pas sur la liste ni la page publique directe.
- Un fichier non-image et un fichier trop gros sont rejetés.
- Le débit de demandes de contact et les accès login sont limités.
- Aucune clé, variable sensible ou information privée n'apparaît dans les pages publiques.
