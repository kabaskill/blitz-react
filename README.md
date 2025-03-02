# Create Minimalist App

A modern CLI tool to quickly scaffold React applications with minimal setup but all the essential tools you need to be productive.

## Installation

Since this package is not yet published on npm, you can install it locally using:

```bash
git clone https://github.com/yourusername/create-minimalist-app.git
cd create-minimalist-app
npm install
npm link
```

## Usage

```bash
create-minimalist-app my-app
```

Or run it without arguments for an interactive prompt:

```bash
create-minimalist-app
```

### Command Line Options

| Option | Description |
| ------ | ----------- |
| `[project-name]` | Name of your project folder |
| `-t, --template <template>` | Template to use: `react-js` or `react-ts` |
| `--no-install` | Skip installing dependencies |
| `--no-git` | Skip git repository initialization |


## Project Structure

```
my-app/
├── public/
│   └── vite.svg
├── src/
│   ├── App.jsx (or App.tsx)
│   ├── main.jsx (or main.tsx)
│   └── styles.css
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── README.md
├── tsconfig.json (TypeScript only)
└── vite.config.js (or vite.config.ts)
```

## Technologies

- **React**: v19.0.0
- **Tailwind CSS**: v4.0.0
- **Vite**: v5.1.0
- **TypeScript**: v5.3.0 (optional)
- **ESLint**: Latest version with React plugins

## Contributing

Contributions are welcome! This is the first iteration of the tool and there are many opportunities for improvement.

