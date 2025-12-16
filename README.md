Developer Log: Building the Base Clicker Mini App

1. Introduction
This project explores the intersection of casual gaming and the Base Onchain ecosystem. Our goal was to build a frictionless "Clicker" game where players can immortalize their high scores as NFTs without needing deep crypto knowledge or paying gas fees. We chose Cocos Creator for a high-performance game experience and NestJS for a robust backend to handle the "invisible" blockchain interactions.

2. Key Challenges Faced
A. Integrating Web3 into a Game Engine
The Challenge: Most Base/Farcaster documentation relies on React-based kits (OnchainKit). However, Cocos Creator uses a dedicated game loop and TypeScript component system that is incompatible with standard React hooks. We couldn't just "import the wallet button." The Solution: We implemented a custom bridge. We accessed the native window.miniapp object provided by the Farcaster/Base environment directly within Cocos components. We built a WalletPanel.ts script that manually triggers the SDK's actions.signIn() method, capturing the user's address and syncing it to our backend without needing a React wrapper.

B. The "Gasless" UX Problem
The Challenge: We wanted a "Web2-like" experience. Asking a user to sign a transaction and pay $0.02 in gas for a game score creates friction. The Solution: We architected a Backend Minting Authority pattern.

Frontend: User clicks "Mint".

Backend: Verifies the score is legit (preventing cheat engines).

Transaction: The Backend (using a private key) submits the transaction to the Base network and pays the gas.

Result: The NFT appears in the user's wallet instantly. The user never sees a gas popup, only a "Success" message.

C. AI Generation Instability
The Challenge: We wanted every high score to generate a unique "Trophy" image using AI. We initially used Hugging Face's Inference API, but encountered significant issues: deprecated API endpoints, "Internal Server Errors" due to model overloading, and complex response parsing (blobs vs. JSON) that crashed our server. The Solution: We migrated to Pollinations.ai. It offered a robust, key-free API that allowed us to construct URL-based prompts (/prompt/pixel-art-trophy-score-100). This proved significantly faster and eliminated the need for complex API key management and error handling, ensuring users always got an image.

3. Technical Decisions
Engine: Cocos Creator (3.8) was chosen for its ability to export lightweight HTML5 mobile builds perfect for Mini Apps.

Backend: NestJS + Prisma gave us type-safe database interactions and easy integration with viem for blockchain operations.

Blockchain: Base Sepolia (Testnet) for fast, low-cost interactions during development.

Smart Contract: A custom ERC-721 contract with Ownable restrictions, ensuring only our game server can mint scores (preventing spoofing).

4. Lessons Learned & Future Improvements
Lesson: "Fail Safe" is critical in GenAI. When the AI API goes down, the game shouldn't crash. We implemented a "Default Trophy" fallback mechanism so the NFT always mints, even if the art generation fails.

Future: We plan to move the image generation fully on-chain (SVG data) to make the NFTs truly permanent and independent of external AI APIs.
