import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, Permission, Role } from '@prisma/client';
const prisma = new PrismaClient();
const password = 'mahendra@123';
async function main(){
  const hash = await bcrypt.hash(password, 12);
  for (const username of ['mecprajan','mecraju']) {
    await prisma.user.upsert({where:{username}, update:{passwordHash:hash, role:Role.SUPER_ADMIN, isActive:true}, create:{username,fullName:username, passwordHash:hash, role:Role.SUPER_ADMIN, mustChangePassword:true}});
  }
  for (const permission of Object.values(Permission)) await prisma.staffPermission.upsert({where:{permission}, update:{}, create:{permission}});
  console.log('Seeded Super Admin accounts and permission catalog.');
}
main().finally(()=>prisma.$disconnect());
