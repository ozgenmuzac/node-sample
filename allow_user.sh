#!/bin/bash


CHAIN_NAME="INTERNET"
INTERFACE="eth13"


function create_if_chain_not_exists()
{
    TABLE_NAME=$1; 
    if iptables -t mangle -nL $TABLE_NAME 2>&1 > /dev/null
    then
        echo "chain $TABLE_NAME exits";
    else
        echo "chain $TABLE_NAME does not exists."
        iptables -N $CHAIN_NAME -t mangle
        iptables -t mangle -A PREROUTING -j $CHAIN_NAME
        iptables -t mangle -A $CHAIN_NAME -i $INTERFACE -j MARK --set-mark 99
    fi
        
}

function allow_mac_address()
{
    MAC=$1;
    re='^[0-9]+$'
    NUMBER_OF_RULE="$(iptables -t mangle -nL $CHAIN_NAME --line-numbers | awk '{print $1}' | tail -1)"
    echo $NUMBER_OF_RULE
    if [[ $NUMBER_OF_RULE =~ $re ]];        
    then
        iptables -t mangle -I $CHAIN_NAME $NUMBER_OF_RULE -m mac --mac-source $MAC -j RETURN 
    else    
        iptables -t mangle -A $CHAIN_NAME -m mac --mac-source $MAC -j RETURN 
    fi   
}

function redirect_to_local()
{
    iptables -t nat -A PREROUTING -m mark --mark 99 -p tcp --dport 80 -j DNAT --to-destination 10.100.49.94:3000
    iptables -t filter -A FORWARD -m mark --mark 99 -j DROP
}

if [ $# -ne 2 ]
then
    echo "Usage: $0 <mac_address> <boolean>"
    exit 1
fi

MAC_ADDRESS=$1
IS_FIRST_USE=$2
create_if_chain_not_exists $CHAIN_NAME
allow_mac_address $MAC_ADDRESS
if [ "$IS_FIRST_USE" == "true" ]
then
    redirect_to_local
fi



