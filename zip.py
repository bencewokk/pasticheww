#!/usr/bin/env python3
"""
📁 Smart Zipper 📁
A generic directory zipping tool with intelligent defaults
"""

import os
import sys
import zipfile
import datetime
import shutil
import argparse
from pathlib import Path
from typing import List, Optional, Set
import time

# ANSI color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_banner():
    """Display a simple banner"""
    banner = f"""
{Colors.CYAN}╔══════════════════════════════════════════════════════════╗
║                {Colors.YELLOW}🚀 Smart Zipper v1.0 🚀{Colors.CYAN}                 ║
╚══════════════════════════════════════════════════════════╝{Colors.ENDC}
    """
    print(banner)

def spinner(message: str):
    """Generator for a simple spinner animation"""
    symbols = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    i = 0
    while True:
        yield f"\r{Colors.CYAN}{symbols[i]}{Colors.ENDC} {message}"
        i = (i + 1) % len(symbols)
        time.sleep(0.1)

def format_size(size_bytes: int) -> str:
    """Format file size in a human-readable format"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024 or unit == 'GB':
            if unit == 'B':
                return f"{size_bytes} {unit}"
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024

def get_excluded_patterns() -> Set[str]:
    """Get standard files and directories to exclude"""
    return {
        '.git', '.github', 'node_modules', '.DS_Store', '__MACOSX',
        '.gitignore', '.env', '.env.local', '.env.development', '.env.production',
        'package-lock.json', 'yarn.lock', '.vscode', '.idea', '.zip',
        'Thumbs.db', 'desktop.ini'
    }

def create_zip(
    source_dir: Optional[str] = None,
    output_path: Optional[str] = None,
    custom_name: Optional[str] = None,
    verbose: bool = False,
    exclude_patterns: Optional[List[str]] = None
) -> str:
    """
    Zips a directory with intelligent defaults
    
    Args:
        source_dir: Path to directory (defaults to current directory)
        output_path: Path where zip should be saved
        custom_name: Custom name for the zip file
        verbose: Show detailed file-by-file output
        exclude_patterns: Additional patterns to exclude
        
    Returns:
        Path to the created zip file
    """
    source_dir = os.path.abspath(source_dir or os.getcwd())
    
    if not os.path.isdir(source_dir):
        print(f"{Colors.RED}Error: {source_dir} is not a valid directory{Colors.ENDC}")
        sys.exit(1)
        
    base_name = custom_name or os.path.basename(source_dir)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    zip_filename = f"{base_name}_{timestamp}.zip"
    
    output_path = os.path.abspath(output_path) if output_path else os.getcwd()
    os.makedirs(output_path, exist_ok=True)
    zip_filepath = os.path.join(output_path, zip_filename)
    
    exclusions = get_excluded_patterns()
    if exclude_patterns:
        exclusions.update(set(exclude_patterns))
    
    total_files = 0
    total_size = 0

    for root, dirs, files in os.walk(source_dir):
        dirs[:] = [d for d in dirs if d not in exclusions and not d.startswith('.')]
        total_files += len([f for f in files if not any(
            f.endswith(ext) or f == ext or f.startswith(ext) for ext in exclusions
        )])

    print(f"{Colors.BOLD}{Colors.BLUE}Preparing to zip directory...{Colors.ENDC}")
    print(f"{Colors.YELLOW}Source:{Colors.ENDC} {source_dir}")
    print(f"{Colors.YELLOW}Output:{Colors.ENDC} {zip_filepath}")
    print(f"{Colors.YELLOW}Excluding:{Colors.ENDC} {', '.join(sorted(exclusions))}")
    print()

    try:
        with zipfile.ZipFile(zip_filepath, 'w', zipfile.ZIP_DEFLATED) as zipf:
            processed = 0
            spin = spinner("Processing files...")

            for root, dirs, files in os.walk(source_dir):
                dirs[:] = [d for d in dirs if d not in exclusions and not d.startswith('.')]
                
                for file in files:
                    if any(file.endswith(ext) or file == ext or file.startswith(ext) for ext in exclusions):
                        continue
                    
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, source_dir)
                    processed += 1
                    progress = int(processed / total_files * 100)
                    
                    if verbose:
                        print(f"\r{Colors.GREEN}[{progress:3d}%]{Colors.ENDC} {rel_path}")
                    else:
                        sys.stdout.write(next(spin))
                        sys.stdout.flush()
                        
                    zipf.write(file_path, rel_path)
                    total_size += os.path.getsize(file_path)

            if not verbose:
                sys.stdout.write("\r" + " " * 80)
                sys.stdout.flush()

        zip_size = os.path.getsize(zip_filepath)
        compression = (1 - (zip_size / total_size)) * 100 if total_size > 0 else 0
        
        print(f"\n{Colors.GREEN}✓ Zip created successfully!{Colors.ENDC}")
        print(f"  {Colors.BOLD}Files:{Colors.ENDC} {processed}/{total_files}")
        print(f"  {Colors.BOLD}Original:{Colors.ENDC} {format_size(total_size)}")
        print(f"  {Colors.BOLD}Compressed:{Colors.ENDC} {format_size(zip_size)} ({compression:.1f}% ratio)")
        
        return zip_filepath
        
    except Exception as e:
        print(f"\n{Colors.RED}Error: {str(e)}{Colors.ENDC}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(
        description="📁 Create smart zip archives with intelligent defaults",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    
    parser.add_argument(
        "-s", "--source",
        help="Directory to zip (default: current)",
        default=None
    )
    
    parser.add_argument(
        "-o", "--output",
        help="Output directory (default: current)",
        default=None
    )
    
    parser.add_argument(
        "-n", "--name",
        help="Custom base name for zip file",
        default=None
    )
    
    parser.add_argument(
        "-v", "--verbose",
        help="Show detailed processing output",
        action="store_true"
    )
    
    parser.add_argument(
        "-e", "--exclude",
        help="Additional exclusions (comma-separated)",
        default=None
    )
    
    args = parser.parse_args()
    
    exclude_patterns = [e.strip() for e in args.exclude.split(",")] if args.exclude else None
    
    print_banner()
    
    create_zip(
        source_dir=args.source,
        output_path=args.output,
        custom_name=args.name,
        verbose=args.verbose,
        exclude_patterns=exclude_patterns
    )

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Operation cancelled{Colors.ENDC}")
        sys.exit(0)