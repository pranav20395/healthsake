// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.1;
 contract Fksake{
    address private owner;
    struct Prescription{
        string issuer_email;
        string hash;
        string uri;
    }
    constructor(){
      owner = msg.sender;
    }
  
    mapping (string => Prescription[]) private fksake_pres;

    function addPres(string memory issuer_email, string memory hash, string memory uri) 
        public{
            require(msg.sender==owner , "Dont have the authority");
        Prescription memory pres = Prescription(issuer_email , hash, uri );
        fksake_pres[issuer_email].push(pres);
    }
    function verifier(string memory issuer_email , string memory hash) public view returns(bool){
        require(msg.sender==owner , "Dont have the authority");
     
        Prescription[] storage pr=  fksake_pres[issuer_email];
        for (uint i = 0 ; i < pr.length ; i++) { 
            if(isEq(hash,pr[i].hash) && isEq(issuer_email, pr[i].issuer_email))return true;     
        }
        return false;

    }
    function isEq(string memory s1 , string memory s2)private pure returns(bool){
        return keccak256(abi.encodePacked(s1)) == keccak256(abi.encodePacked(s2));
    }
    function remPres(string memory issuer_email,string memory hash ) public returns(bool){
        require(msg.sender==owner , "Dont have the authority");
        Prescription[] storage pr=  fksake_pres[issuer_email];

        for (uint i = 0 ; i < pr.length ; i++) { 
            if(isEq(hash,pr[i].hash) && isEq(issuer_email, pr[i].issuer_email)){
                delete pr[i];
                return true;
            } 
        }
        return false;
    }
    
 }