# Create Minimalist React App

A modern CLI tool to quickly scaffold React applications with minimal setup but all the essential tools you need to be productive. This tool creates a streamlined developer experience without unnecessary bloat.

## Features 

- ⚡ **Vite**: For optimized builds and fast build times, the tool bundles the apps with Vite
- 🎨 **Tailwind v4**: Pretty much nothing needed to be said here 
- 📦 **Minimal Dependencies**: Only the essential packages you need
- 🧹 **Clean Structure**: Logical project organization with no unnecessary files
- 🔄 **Git Integration**: Automatic repo initialization (optional)

## Installation


```bash
npm install -g minimal-react
```

## Usage

### Quick Start

```bash
minimal-react my-app
```

This command will:

1. Create a new directory called `my-app`
2. Generate a React project with the default template
3. Install all necessary dependencies
4. Initialize a git repository

### Interactive Mode

Run without arguments for an interactive prompt:

```bash
minimal-react
```

The CLI will guide you through the following options:

- Project name
- Template selection (JavaScript or TypeScript)
- Install dependencies
- Initialize a git repository

### Command Line Options

| Option                      | Description                               |
| --------------------------- | ----------------------------------------- |
| `[project-name]`            | Name of your project folder               |
| `-t, --template <template>` | Template to use: `react-js` or `react-ts` |
| `--no-install`              | Skip installing dependencies              |
| `--no-git`                  | Skip git repository initialization        |
| `-v, --version`             | Display version information               |
| `--help`                    | Show help information                     |

### Examples

```bash
# Create a TypeScript project
minimal-react my-ts-app --template react-ts

# Create a JavaScript project without installing dependencies
minimal-react my-js-app --template react-js --no-install

# Create a project without git initialization
minimal-react my-app --no-git
```

## Generated Project Structure

The tool creates a clean, minimal React project structure:

```
my-app/
├── public/
│   
├── src/
│   ├── App.jsx (or App.tsx)
│   ├── main.jsx (or main.tsx)
│   ├── components/
│   │   └── Footer.jsx (or Footer.tsx)    //You can delete this footer component freely
│   └── styles.css                        //There are some nice colors here - inspired by Dracula theme
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── README.md
├── tsconfig.json (TypeScript only)
└── vite.config.js (or vite.config.ts)
```

### Project Configuration Files

- **package.json**: Contains project dependencies and scripts
- **vite.config.js/ts**: Vite configuration with React plugin
- **tsconfig.json**: TypeScript configuration (only for TS projects)
- **eslint.config.js**: ESLint configuration with React rules

### Available Scripts

Once your project is generated, you can use the following npm scripts:

```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

## Tech Stack

- **React 19**: Latest version of React
- **Tailwind v4**: Utility-first CSS framework
- **Vite**: Next-generation frontend tooling
- **TypeScript**: Optional static type checking
- **ESLint**: Code linting with React-specific rules

Each dependency is automatically fetched at its latest stable version during project creation.

## Planned Features

 - A testing framework 
 - Project folder alias creation option for more accessible imports
 - Some sort of router option for React projects
 - More frameworks (Vue, Svelte, Next etc.)

## Troubleshooting

If you encounter any issues during installation or project generation:

1. Ensure you have Node.js 18+ installed
2. Check that npm is properly configured
3. Make sure you have write permissions in your target directory

If installation fails, the CLI will offer to clean up any partially created files. This is feature was hard to test, so always check the project location for undeleted files if the cli fails for some reason.


## Contributing

Contributions are welcome and appreciated! Here's how you can contribute:

1. **Fork the repository** and create your branch from `main`
2. **Clone your fork** and set up the development environment:
   ```bash
   git clone https://github.com/kabaskill/minimal-react.git
   cd minimal-react
   npm install
   ```
3. **Make your changes** and test them thoroughly
4. **Add new templates** by creating directories in the `templates` folder
5. **Update documentation** as needed
6. **Submit a pull request** with a clear description of your changes

### Development Workflow

1. Run `npm link` to use your local development version
2. Make changes to the codebase
3. Test your changes by running the CLI in a separate directory
4. Use `npm unlink minimal-react` when you're done

### Project Structure

```
minimal-react/
├── src/
│   ├── cli.ts           # Main CLI entry point
│   ├── config.ts        # Configuration and template settings
│   ├── generators.ts    # Project generation logic
│   ├── types.ts         # TypeScript types and interfaces
│   └── utils.ts         # Helper functions
├── templates/
│   ├── common/          # Shared template files
│   ├── react-js/        # JavaScript template
│   └── react-ts/        # TypeScript template
└── package.json
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
