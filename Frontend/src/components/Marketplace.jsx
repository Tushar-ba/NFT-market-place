import { useEffect, useState } from 'react';
import { loadBlockchainData } from '../utils/loadBlockchainData'; // Ensure this path is correct
import { pinFileToIPFS } from '../utils/pinataService'; // Ensure this path is correct
import NFTCard from './NFTCard';
import { ethers } from 'ethers';

const Marketplace = () => {
  const [nfts, setNfts] = useState([]);
  const [signer, setSigner] = useState(null);
  const [nftMarketplaceContract, setNftMarketplaceContract] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [image, setImage] = useState(null);
  const [nftData, setNftData] = useState({ name: '', description: '' });
  const [offerAmount, setOfferAmount] = useState(0);

  useEffect(() => {
    const loadMarketplace = async () => {
      const { signer, nftMarketplaceContract, nftContract } = await loadBlockchainData();
      setSigner(signer);
      setNftMarketplaceContract(nftMarketplaceContract);
      setNftContract(nftContract);
      loadNFTs(nftMarketplaceContract);
    };

    loadMarketplace();
  }, []);

  const loadNFTs = async (marketplaceContract) => {
    const nftCount = await marketplaceContract.getListedNFTs(); // Update according to your contract
    const nftList = await Promise.all(
      nftCount.map(async (tokenId) => {
        const nft = await marketplaceContract.nfts(tokenId); // Update according to your contract
        return { ...nft, tokenId };
      })
    );
    setNfts(nftList);
  };

  const handleImageChange = (e) => {
    // Check if a file is selected
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]); // Set the first file selected
    } else {
      setImage(null); // Reset image if no file is selected
    }
  };

  const handleMintNFT = async () => {
    if (!image || !nftData.name || !nftData.description) {
      alert("Please fill in all fields and upload an image.");
      return;
    }

    try {
      const imageURI = await pinFileToIPFS(image);
      const metadata = {
        name: nftData.name,
        description: nftData.description,
        image: imageURI,
      };

      // Assuming your mint function is called 'mintNFT'
      const tx = await nftContract.mintNFT(await signer.getAddress(), JSON.stringify(metadata));
      await tx.wait();
      alert('NFT minted successfully!');
      loadNFTs(nftMarketplaceContract); // Reload NFTs after minting
    } catch (error) {
      console.error("Error minting NFT", error);
    }
  };

  const handleBuy = async (nft) => {
    try {
      const tx = await nftMarketplaceContract.buyNFT(nft.tokenId, { value: ethers.utils.parseEther(nft.price) });
      await tx.wait();
      alert('NFT purchased successfully!');
      loadNFTs(nftMarketplaceContract); // Reload NFTs after buying
    } catch (error) {
      console.error("Error buying NFT", error);
    }
  };

  const handleMakeOffer = async (nft) => {
    try {
      const tx = await nftMarketplaceContract.makeOffer(nft.tokenId, ethers.utils.parseEther(offerAmount));
      await tx.wait();
      alert('Offer made successfully!');
    } catch (error) {
      console.error("Error making offer", error);
    }
  };

  return (
    <div>
      <h1>NFT Marketplace</h1>
      <input type="file" onChange={handleImageChange} />
      <input 
        type="text" 
        placeholder="NFT Name" 
        onChange={(e) => setNftData({ ...nftData, name: e.target.value })} 
      />
      <input 
        type="text" 
        placeholder="NFT Description" 
        onChange={(e) => setNftData({ ...nftData, description: e.target.value })} 
      />
      <button onClick={handleMintNFT}>Mint NFT</button>
      
      {/* Display NFTs */}
      {nfts.map((nft) => (
        <NFTCard 
          key={nft.tokenId} 
          nft={nft} 
          onBuy={handleBuy} 
          onMakeOffer={handleMakeOffer} 
        />
      ))}
    </div>
  );
};

export default Marketplace;
