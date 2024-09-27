import { ethers } from 'ethers';
import NFTMarketplace from './NFTMarketplace.json';
import MyNFT from './MyNFT.json';



const loadBlockchainData = async () => {
  const { ethereum } = window;


  if (!ethereum) {
    alert("Please install MetaMask!");
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner(); // Ensure you're using await here
    const network = await provider.getNetwork();

    const nftMarketplaceContract = new ethers.Contract(
      '0xb6c58fdb4bbffed7b7224634ab932518a29e4c4b',
      NFTMarketplace.abi,
      signer
    );

    const nftContract = new ethers.Contract(
      '0x09572ced4772527f28c6ea8e62b08c973fc47671',
      MyNFT.abi,
      signer
    );

    return { signer, nftMarketplaceContract, nftContract };
  } catch (error) {
    console.error("Error loading blockchain data", error);
    alert("Failed to load blockchain data.");
  }
}

export { loadBlockchainData };
