const fs = require('fs');
const path = require('path');

// 1. UPDATE auth.ts
const authTsPath = path.join(__dirname, 'src', 'lib', 'auth.ts');
let authTs = fs.readFileSync(authTsPath, 'utf8');

authTs = `import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Life OS Key",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) throw new Error("Missing credentials");

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          // Auto-register new user
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const newUser = await prisma.user.create({
            data: {
              email: credentials.email,
              password: hashedPassword,
            }
          });
          return { id: newUser.id, email: newUser.email };
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) throw new Error("Invalid password");

        return { id: user.id, email: user.email };
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub; // Inject user ID into session
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
`;
fs.writeFileSync(authTsPath, authTs);
console.log('Updated auth.ts');

// 2. UPDATE schema.prisma
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const excludeModels = ['User', 'RoutineStep'];
let newSchema = '';
const parts = schema.split(/^model /m);
newSchema += parts[0];

for (let i = 1; i < parts.length; i++) {
  let modelBody = parts[i];
  const modelName = modelBody.split(' ')[0].trim();
  
  if (!excludeModels.includes(modelName)) {
    const insertPos = modelBody.lastIndexOf('}');
    if (insertPos !== -1) {
      const relationStr = `\n  userId      String?\n  user        User?    @relation(fields: [userId], references: [id], onDelete: Cascade)\n`;
      modelBody = modelBody.substring(0, insertPos) + relationStr + modelBody.substring(insertPos);
    }
  }
  newSchema += 'model ' + modelBody;
}

const modelsAddedTo = [];
for (let i = 1; i < parts.length; i++) {
  const modelName = parts[i].split(' ')[0].trim();
  if (!excludeModels.includes(modelName)) {
    modelsAddedTo.push(modelName);
  }
}

let userRelations = '';
for (const m of modelsAddedTo) {
  const lowerName = m.charAt(0).toLowerCase() + m.slice(1);
  userRelations += `  ${lowerName}s ${m}[]\n`;
}

const userStart = newSchema.indexOf('model User {');
const userEnd = newSchema.indexOf('}', userStart);
newSchema = newSchema.substring(0, userEnd) + userRelations + newSchema.substring(userEnd);

fs.writeFileSync(schemaPath, newSchema);
console.log('Updated schema.prisma');
