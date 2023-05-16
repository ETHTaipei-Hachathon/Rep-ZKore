// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IVerifier.sol";

contract ZKore is ERC721, Ownable {
    using Counters for Counters.Counter;

    event SafeMint(address to, uint tokenId);

    Counters.Counter private _tokenIdCounter;

    IVerifier public verifier;
    constructor(
        IVerifier _verifier
    ) ERC721("ZKore", "ZKORE") {
        verifier = _verifier;
    }

    function safeMint(
        address to, 
        uint[2] memory a, 
        uint[2][2] memory b, 
        uint[2] memory c,
        uint[4] memory input
    ) public {
        verifier.verifyProof(a,b,c,input);
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        emit SafeMint(to, tokenId);
    }

    // only for test
    function superMint(
        address to
    ) public returns (uint) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        emit SafeMint(to, tokenId);
        return tokenId;
    }

    function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Only the owner of the token can burn it.");
        _burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireMinted(tokenId);

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? baseURI : "";
    }

    function _beforeTokenTransfer(address from, address to, uint256, uint256) pure override internal {
        require(
            from == address(0) || to == address(0), 
            "This a Soulbound token. It cannot be transferred. It can only be burned by the token owner."
        );
    }

    function _burn(uint256 tokenId) internal override(ERC721) {
        super._burn(tokenId);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://Qma6y6DkXuYtWAcN4sJsuf16YfRJUQuTAR1vL6TpqP9m4C";
    }
}