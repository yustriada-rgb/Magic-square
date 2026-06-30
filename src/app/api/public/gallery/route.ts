import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(){return NextResponse.json(await prisma.album.findMany({where:{isPublished:true},include:{photos:{take:12,orderBy:{sortOrder:'asc'}}},orderBy:{sortOrder:'asc'}}));}
