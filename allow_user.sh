#!/bin/bash


CHAIN_NAME="INTERNET"
INTERFACE="eth13"
#INTERFACE="$(awk -F= '$1 ~/BLUE_DEV/ {print $2}' /var/efw/ethernet/settings)"
RED_ADDRESS="$(awk -F= '$1 ~/RED_ADDRESS/ {print $2}' /var/efw/uplinks/main/settings)"


function create_if_chain_not_exists()
{
    TABLE_NAME=$1; 
    if ! iptables -t mangle -nL $TABLE_NAME 2>&1 > /dev/null
    then
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
        iptables -t mangle -I $CHAIN_NAME $NUMBER_OF_RULE -m mac --mac-source $MAC -j RETURN 2>&1 > /dev/null 
    else    
        iptables -t mangle -A $CHAIN_NAME -m mac --mac-source $MAC -j RETURN 2>&1 > /dev/null
    fi   
}

function redirect_to_local()
{
    iptables-save | grep 'PREROUTING -p tcp -m mark --mark 0x63 -m tcp --dport 80 -j DNAT' 2>&1 > /dev/null 
    if [ $? -eq 1 ]
    then
        iptables -t nat -A PREROUTING -m mark --mark 99 -p tcp --dport 80 -j DNAT --to-destination $RED_ADDRESS:3000 2>&1 > /dev/null
        #iptables -t nat -A PREROUTING -m mark --mark 99 -p tcp --dport 443 -j DNAT --to-destination $RED_ADDRESS:3000 2>&1 > /dev/null
        iptables -t filter -A FORWARD -m mark --mark 99 -j DROP 2>&1 > /dev/null
    fi
}

function deny_mac_address()
{
    MAC=$1;
    iptables -t mangle -D $CHAIN_NAME -m mac --mac-source $MAC -j RETURN 2>&1 > /dev/null
}

if [ $# -ne 2 ]
then
    echo "Usage: $0 <--allow/--deny> <mac_address>"
    exit 1
fi

MOD=$1
MAC_ADDRESS=$2

create_if_chain_not_exists $CHAIN_NAME

if [ "$MOD" == "--allow" ]
then
    allow_mac_address $MAC_ADDRESS
elif [ "$MOD" == "--deny" ]
then
    deny_mac_address $MAC_ADDRESS
else
    echo "Wrong flag specified"
fi

redirect_to_local
