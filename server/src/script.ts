import { prisma } from "./lib/prisma";
const prismaClient = prisma as any;

async function main() {
  
  await prisma.post.deleteMany({
  where: {
    author: {
      email: "alice@prisma.io",
    },
  },
});

  const deleteUser = await prismaClient.user.delete({
    where: {
      email: "alice@prisma.io",

    },
  });
  console.log("Deleted user:", deleteUser);

  // Fetch all users with their posts
  const allUsers = await prismaClient.user.findMany({
    include: {
      posts: true,
    },
  });
  console.log("All users:", JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });