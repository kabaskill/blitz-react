# Create Minimalist React App

A modern CLI tool to quickly scaffold React applications with minimal setup but all the essential tools you need to be productive. This tool creates a streamlined developer experience without unnecessary bloat.

## Features

- 🚀 **Fast Setup**: Generate a complete React project in seconds
- ⚡ **Vite-powered**: Lightning-fast development server and optimized builds
- 🎨 **Tailwind CSS**: Pre-configured for utility-first styling
- 🔍 **TypeScript Support**: Optional static typing for improved developer experience
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
│   └── vite.svg
├── src/
│   ├── App.jsx (or App.tsx)
│   ├── main.jsx (or main.tsx)
│   ├── components/
│   │   └── .gitkeep
│   └── styles.css
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── README.md
├── tailwind.config.js
├── tsconfig.json (TypeScript only)
└── vite.config.js (or vite.config.ts)
```

### Project Configuration Files

- **package.json**: Contains project dependencies and scripts
- **vite.config.js/ts**: Vite configuration with React plugin
- **tailwind.config.js**: Tailwind CSS configuration
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

## Technologies

The generated projects use modern web development tools:

- **React**: Latest version with hooks and functional components
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Next-generation frontend tooling
- **TypeScript**: Optional static type checking
- **ESLint**: Code linting with React-specific rules

Each dependency is automatically fetched at its latest stable version during project creation.

## Customization

After generating a project, you can easily customize it by:

1. Adding additional dependencies through npm/yarn
2. Modifying the Vite configuration for custom build settings
3. Extending Tailwind configuration for your design system
4. Adding your preferred testing framework

## Troubleshooting

If you encounter any issues during installation or project generation:

1. Ensure you have Node.js 18+ installed
2. Check that npm is properly configured
3. Make sure you have write permissions in your target directory

If installation fails, the CLI will offer to clean up any partially created files.

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

## Acknowledgments

- Inspired by Create React App and modern React tooling
- Built with TypeScript and Node.js
- Uses Handlebars for template processing
