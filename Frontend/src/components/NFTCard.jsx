const NFTCard = ({ nft }) => {
  if (!nft) {
    return <div>Loading...</div>; // Handle case where nft is undefined
  }

  return (
    <div className="nft-card">
      <img src={nft.image} alt={nft.name} />
      <h2>{nft.name}</h2>
      <p>{nft.description}</p>
    </div>
  );
};

export default NFTCard;
