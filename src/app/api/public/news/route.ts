import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(){return NextResponse.json(await prisma.news.findMany({where:{isPublished:true},orderBy:{publishedAt:'desc'},take:50}));}
