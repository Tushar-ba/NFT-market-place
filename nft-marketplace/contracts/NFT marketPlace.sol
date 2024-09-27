// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarketplace is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    uint256 listingPrice = 0.025 ether;

    constructor() {
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        mapping(address => Offer) offers;
    }
    struct SimplifiedMarketItem {
    uint itemId;
    address nftContract;
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
}

    struct Offer {
        address bidder;
        uint256 amount;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated(uint indexed itemId, address indexed nftContract, uint256 indexed tokenId, address seller, address owner, uint256 price, bool sold);
    event MarketItemSold(uint indexed itemId, address owner);
    event OfferPlaced(uint indexed itemId, address bidder, uint256 amount);
    event OfferAccepted(uint indexed itemId, address bidder, uint256 amount);
    event ListingCancelled(uint indexed itemId);

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        require(msg.value == listingPrice, "Price must be equal to listing price");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();
  
        idToMarketItem[itemId].itemId = itemId;
        idToMarketItem[itemId].nftContract = nftContract;
        idToMarketItem[itemId].tokenId = tokenId;
        idToMarketItem[itemId].seller = payable(msg.sender);
        idToMarketItem[itemId].owner = payable(address(0));
        idToMarketItem[itemId].price = price;
        idToMarketItem[itemId].sold = false;

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(itemId, nftContract, tokenId, msg.sender, address(0), price, false);
    }

    function createMarketSale(
        address nftContract,
        uint256 itemId
    ) public payable nonReentrant {
        uint price = idToMarketItem[itemId].price;
        uint tokenId = idToMarketItem[itemId].tokenId;
        require(msg.value == price, "Please submit the asking price in order to complete the purchase");

        idToMarketItem[itemId].seller.transfer(msg.value);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();
        payable(owner).transfer(listingPrice);

        emit MarketItemSold(itemId, msg.sender);
    }

    function makeOffer(uint256 itemId) public payable {
        require(idToMarketItem[itemId].sold == false, "Item already sold");
        require(msg.value > 0, "Offer must be greater than 0");
        require(msg.value > idToMarketItem[itemId].offers[msg.sender].amount, "New offer must be higher than your previous offer");

        if (idToMarketItem[itemId].offers[msg.sender].amount > 0) {
            payable(msg.sender).transfer(idToMarketItem[itemId].offers[msg.sender].amount);
        }

        idToMarketItem[itemId].offers[msg.sender] = Offer(msg.sender, msg.value);

        emit OfferPlaced(itemId, msg.sender, msg.value);
    }

    function acceptOffer(uint256 itemId, address bidder) public nonReentrant {
        require(idToMarketItem[itemId].seller == msg.sender, "Only seller can accept offers");
        require(idToMarketItem[itemId].sold == false, "Item already sold");
        
        uint256 amount = idToMarketItem[itemId].offers[bidder].amount;
        require(amount > 0, "No offer from this bidder");

        idToMarketItem[itemId].seller.transfer(amount);
        IERC721(idToMarketItem[itemId].nftContract).transferFrom(address(this), bidder, idToMarketItem[itemId].tokenId);
        idToMarketItem[itemId].owner = payable(bidder);
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();
        payable(owner).transfer(listingPrice);

        emit OfferAccepted(itemId, bidder, amount);
        emit MarketItemSold(itemId, bidder);
    }

    function cancelListing(uint256 itemId) public nonReentrant {
        require(idToMarketItem[itemId].seller == msg.sender, "Only seller can cancel listing");
        require(idToMarketItem[itemId].sold == false, "Item already sold");

        IERC721(idToMarketItem[itemId].nftContract).transferFrom(address(this), msg.sender, idToMarketItem[itemId].tokenId);
        idToMarketItem[itemId].sold = true;
        payable(msg.sender).transfer(listingPrice);

        emit ListingCancelled(itemId);
    }

    function fetchMarketItems() public view returns (SimplifiedMarketItem[] memory) {
    uint itemCount = _itemIds.current();
    uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
    uint currentIndex = 0;

    SimplifiedMarketItem[] memory items = new SimplifiedMarketItem[](unsoldItemCount);
    for (uint i = 0; i < itemCount; i++) {
        if (idToMarketItem[i + 1].owner == address(0)) {
            uint currentId = i + 1;
            MarketItem storage currentItem = idToMarketItem[currentId];
            items[currentIndex] = SimplifiedMarketItem(
                currentItem.itemId,
                currentItem.nftContract,
                currentItem.tokenId,
                currentItem.seller,
                currentItem.owner,
                currentItem.price,
                currentItem.sold
            );
            currentIndex += 1;
        }
    }
    return items;
}
}