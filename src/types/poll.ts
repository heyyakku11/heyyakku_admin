export interface Poll{
    id:string,
    creatorId:string,
    status:string,
    optionType:string,
    totalVoteCount:number
    expiresAt:Date
    createdAt:Date
}