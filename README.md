# CW Practicer

A comprehensive Morse code training web application built with React + Vite.

## Features

### 📻 Receive Practice (Koch Method Trainer)
- Learn CW using the proven Koch method
- Adjustable character and effective speed (WPM)
- Progressive lesson system with 40 characters
- Focused character drilling mode
- Track accuracy and progress over time
- Customizable tone frequency

### 📡 Send Practice
Two keying modes available:

**Straight Key Mode**
- Use `Space` bar as a manual key
- Hold to send, duration determines dit or dah
- Great for beginners learning timing

**Iambic Paddle Mode**
- Use `,` (comma) for dit paddle
- Use `.` (period) for dah paddle
- Supports both Mode A and Mode B
- Squeeze keying for automatic alternation
- Perfect for practicing with real paddle technique

### Practice Modes
- **Free Practice**: Send anything you want
- **Copy Challenge**: Send what you see on screen

## Live Demo

Visit: [https://0x00a0.github.io/cw-practicer](https://0x00a0.github.io/cw-practicer)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Web Audio API

## Deployment

This project is automatically deployed to GitHub Pages via GitHub Actions when pushing to the `main` branch.

## License

MIT

