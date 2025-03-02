// app/page.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';
// Next.js의 Image 컴포넌트 모킹
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className, priority }) => {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority ? 'true' : undefined}
        data-testid={`image-${alt.replace(/\s+/g, '-').toLowerCase()}`}
      />
    )
  }
}))

describe('Home 컴포넌트', () => {
  it('Next.js 로고가 렌더링되어야 한다', () => {
    render(<Home />)
    const logo = screen.getByTestId('image-next.js-logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/next.svg')
    expect(logo).toHaveAttribute('alt', 'Next.js logo')
  })

  it('리스트 항목이 올바르게 렌더링되어야 한다', () => {
    render(<Home />)
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(2)
    
    expect(listItems[0]).toHaveTextContent('Get started by editing')
    expect(listItems[0]).toHaveTextContent('src/app/page.tsx')
    
    expect(listItems[1]).toHaveTextContent('Save and see your changes instantly.')
  })

  it('Deploy now 링크가 올바른 속성을 가져야 한다', () => {
    render(<Home />)
    const deployLink = screen.getByRole('link', { name: /deploy now/i })
    
    expect(deployLink).toHaveAttribute('href', 'https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app')
    expect(deployLink).toHaveAttribute('target', '_blank')
    expect(deployLink).toHaveAttribute('rel', 'noopener noreferrer')
    
    const vercelLogo = screen.getByTestId('image-vercel-logomark')
    expect(vercelLogo).toBeInTheDocument()
  })

  it('Read our docs 링크가 올바른 속성을 가져야 한다', () => {
    render(<Home />)
    const docsLink = screen.getByRole('link', { name: /read our docs/i })
    
    expect(docsLink).toHaveAttribute('href', 'https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app')
    expect(docsLink).toHaveAttribute('target', '_blank')
    expect(docsLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('푸터에 3개의 링크가 있어야 한다', () => {
    render(<Home />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
    
    const learnLink = screen.getByRole('link', { name: /learn/i })
    expect(learnLink).toHaveAttribute('href', 'https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app')
    
    const examplesLink = screen.getByRole('link', { name: /examples/i })
    expect(examplesLink).toHaveAttribute('href', 'https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app')
    
    const nextjsOrgLink = screen.getByRole('link', { name: /go to nextjs.org →/i })
    expect(nextjsOrgLink).toHaveAttribute('href', 'https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app')
  })

  it('푸터에 아이콘 이미지가 있어야 한다', () => {
    render(<Home />)
    
    const fileIcon = screen.getByTestId('image-file-icon')
    expect(fileIcon).toBeInTheDocument()
    
    const windowIcon = screen.getByTestId('image-window-icon')
    expect(windowIcon).toBeInTheDocument()
    
    const globeIcon = screen.getByTestId('image-globe-icon')
    expect(globeIcon).toBeInTheDocument()
  })
})