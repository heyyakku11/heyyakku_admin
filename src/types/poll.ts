export interface Poll{
    id:string,
    question:string,
    creatorId:string,
    status:string,
    optionType:string,
    totalVoteCount:number
    expiresAt:string | null,
    createdAt:string,
}