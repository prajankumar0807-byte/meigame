export type Role='SUPER_ADMIN'|'STAFF'|'USER'|'PARTICIPANT';
export type User={id:string;fullName:string;username:string;role:Role;department?:string;year?:number;email?:string;isActive:boolean;mustChangePassword:boolean};
export type Quiz={id:string;title:string;description?:string;subject?:string;status:string;joinCode:string;leaderboardEnabled:boolean;_count?:{questions:number;participants:number}};
