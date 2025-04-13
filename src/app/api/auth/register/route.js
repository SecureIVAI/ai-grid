import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { name, email, password } = await request.json()

    // make sure all fields are provided
    // TODO: add more validation (e.g. email format, password strength, vulnerability checks) 
    if (!name || !email || !password) {
      console.error('Validation failed: Missing required fields')
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // if user already exists, return error
    if (existingUser) {
      console.error(`User with email ${email} already exists`)
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      )
    }

    // hash password, possibly change to use crypto
    const hashedPassword = await bcrypt.hash(password, 12)

    // determine user role based on name for now
    const userRole = name.toLowerCase() === 'admin' ? 'admin' : 'user'

    // create user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: userRole
      }
    })

    console.log('User successfully registered:', user)

    return NextResponse.json(
      { success: true },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

