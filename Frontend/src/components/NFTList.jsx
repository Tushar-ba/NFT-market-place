// src/components/NFTList.jsx
import  { useEffect, useState } from 'react';
import NFTCard from './NFTCard';

const NFTList = () => {
  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    // Assume fetchNFTs fetches the NFT data from your smart contract
    const loadNFTs = async () => {
        const nftData = await fetchNFTs(); // Fetch logic
        console.log(nftData); // Log the data structure
        setNfts(nftData);
      };
      

    loadNFTs();
  }, []);

  return (
    <div className="nft-list">
      {nfts.map((nft) => (
        <NFTCard key={nft.tokenId} nft={nft} /> // Ensure nft is defined
      ))}
    </div>
  );
};

export default NFTList;
