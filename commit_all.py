import os
import subprocess
import time

def run_command(command):
    try:
        subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        print(e.stderr.decode())
        return False

def get_human_message(filepath, status_code):
    filename = os.path.basename(filepath)
    name, ext = os.path.splitext(filename)
    
    action = "added"
    if "M" in status_code:
        action = "updated"
    
    if filename == "vite.config.ts":
        return "configured vite and removed lovable tags"
    if filename == "package.json":
        return "updated dependencies and removed unused packages"
    if filename == "index.html":
        return "cleaned up index.html meta tags"
    if filename == ".gitignore":
        return "added gitignore to keep things clean"
    if filename == "README.md":
        return "added a readme file"
    if filename == "tsconfig.json":
        return "set up typescript configuration"
    if filename == "tailwind.config.ts":
        return "fixed tailwind configuration imports"
    if filename == "command.tsx" or filename == "textarea.tsx":
        return f"fixed types in {name} component"

    if ext == ".tsx":
        return f"{action} the {name} component"
    if ext == ".ts":
        return f"{action} {name} utility/config"
    if ext == ".css":
        return f"{action} styles for {name}"
    if ext == ".json":
        return f"{action} {name} configuration"
    
    return f"{action} {filename}"

# Get all files
files_output = subprocess.check_output("find . -type f -not -path '*/.*' -not -path '*/node_modules/*' -not -path './dist/*' | sort", shell=True).decode()
files = [f.strip() for f in files_output.split('\n') if f.strip()]

# Filter out the script itself if it's in the list (it shouldn't be if I put it in tmp or name it with dot, but just in case)
files = [f for f in files if "commit_all.py" not in f]

total = len(files)
print(f"Found {total} files to commit.")

for i, filepath in enumerate(files):
    # Check if file has changes or is untracked
    status = subprocess.run(f"git status --porcelain {filepath}", shell=True, stdout=subprocess.PIPE).stdout.decode().strip()
    
    if not status:
        print(f"Skipping {filepath} (no changes)")
        continue
        
    print(f"[{i+1}/{total}] Committing {filepath}...")
    
    # Add
    if not run_command(f"git add {filepath}"):
        continue
        
    # Commit
    msg = get_human_message(filepath, status)
    if not run_command(f'git commit -m "{msg}"'):
        continue
        
    # Push
    print(f"Pushing {filepath}...")
    if not run_command("git push"):
        print("Push failed, retrying in 2s...")
        time.sleep(2)
        run_command("git push")
        
print("Done!")
