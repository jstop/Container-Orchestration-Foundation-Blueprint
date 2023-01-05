source ./aws_variables.sh
#rolearn="arn:aws:iam::899456967600:user/AWSReservedSSO_AWSAdministratorAccess_30f517a3940f0385/jstein"
rolearn="arn:aws:iam::899456967600:role/aws-reserved/sso.amazonaws.com/AWSReservedSSO_AWSAdministratorAccess_30f517a3940f0385"
eksctl delete iamidentitymapping --cluster eksworkshop-eksctl --arn ${rolearn} #--group system:masters --username admin
