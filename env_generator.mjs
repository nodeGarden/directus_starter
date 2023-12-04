
import Inquirer from 'inquirer';
import RandExp from 'randexp';
import fs from 'fs';


console.log('----=[ Hi, welcome to the Directus Generator ]=----');

const questions = [
    {
        type: 'input',
        name: 'app_name',
        message: 'App Name. [Keep this short and lowercase with underscores]: ',
        default: "myapp",
        transformer: ((answer) => answer.toLowerCase().replace(" ", "_"))
    },
    {
        type: 'list',
        name: 'app_env',
        message: 'Environment',
        default: "dev",
        choices: ['dev', 'staging', 'production'],
        filter(val) {
          return val.toLowerCase();
        },
    },
    {
        type: 'input',
        name: 'email_domain',
        message: 'Email Domain. [Do not add @ or username. e.g. gmail.com]: ',
        default: "nodegarden.net",
        validate: (answer) => { return !!answer.toLowerCase().match(/^([\w-]+\.)+[\w-]{2,4}$/) }
    },
    {
        type: 'input',
        name: 'email_user',
        message: 'Email User. [what appears before the @ symbol]: ',
        default: "mondo"
    },
    {
        type: 'input',
        name: 'app_port',
        message: 'App Port: ',
        default: "8055"
    },
    {
        type: 'input',
        name: 'mysql_port',
        message: 'MySQL Port: ',
        default: "3306"
    }
];




Inquirer.prompt(questions).then((answers) => {
    console.log(JSON.stringify(answers, null, '  '));

    const key = new RandExp(/^([a-zA-Z]){8}-([a-zA-Z]){4}-([a-zA-Z]){4}-([a-zA-Z]){4}-([a-zA-Z]){8}$/).gen();
    const secret = new RandExp(/^([a-zA-Z]){8}-([a-zA-Z]){4}-([a-zA-Z]){4}-([a-zA-Z]){4}-([a-zA-Z]){8}$/).gen();
    const admin_password = new RandExp(/^([a-zA-Z]){8}-([a-zA-Z]){4}-([a-zA-Z]){4}-([a-zA-Z]){4}-([a-zA-Z]){8}$/).gen();
    const db_pass = new RandExp(/^([a-zA-Z]){8}-([a-zA-Z]){4}-([a-zA-Z]){4}-([a-zA-Z]){4}-([a-zA-Z]){8}$/).gen();
    const db_root = new RandExp(/^([a-zA-Z]){8}-([a-zA-Z]){4}-([a-zA-Z]){4}-([a-zA-Z]){4}-([a-zA-Z]){8}$/).gen();
    

    const env_template = `
        APP_NAME=${answers.app_name}
        APP_ENV=${answers.app_env}
        APP_KEY=${key}
        APP_SECRET=${secret}
        APP_ADMIN_PASSWORD=${admin_password}
        APP_EMAIL_DOMAIN=${answers.email_domain}
        APP_EMAIL_USER=${answers.email_user}
        APP_PORT=${answers.app_port}
        
        DATABASE_HOST=${answers.app_name}-mysql
        DATABASE_PORT=${answers.mysql_port}
        DATABASE_NAME=${answers.app_name}
        DATABASE_USERNAME=directus_user
        DATABASE_PASSWORD=${db_pass}
        DATABASE_ROOT_PASSWORD=${db_root}
    `;

    // fs.writeFile(".env-" + answers.app_name, env_template, err => {
    fs.writeFile(".env", env_template, err => {
            if (err) { console.error(err); }
      });
  });

  