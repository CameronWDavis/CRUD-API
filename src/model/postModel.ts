export class postObj{
    postId:number = 0;
    createdDate:Date;
    title:string= '';
    contnt:string=''; 
    userId:string = ''; 
    headerImage:string = ''; 
    lastUpdated:Date;
    constructor(postId:number, createdDate:Date, title:string, content:string,userId:string, headerImage:string, lastUpdated:Date){
    this.postId = postId;
    this.createdDate=createdDate;
    this.title = title;
    this.contnt=content;
    this.userId = userId;
    this.headerImage = headerImage;
    this.lastUpdated = lastUpdated;
    }
}
