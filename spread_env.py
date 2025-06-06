# Load .env
with open(".env") as f:
    lines = f.readlines()
    env_vars = {}
    for line in lines:
        if line.strip() and not line.startswith("#"):
            key, value = line.split("=", 1)
            env_vars[key.strip()] = value.strip().strip('"').strip("'")

# Recursively find ".env.requirement" files
def find_env_requirements(path):
    import os
    requirements = []
    for root, dirs, files in os.walk(path):
        if ".env.requirement" in files:
            requirements.append(os.path.join(root, ".env.requirement"))
    return requirements

def get_name_and_rename(line):
    data = line.split(":")
    if len(data) == 1:
        actual_name = rename_to = data[0].strip()
    elif len(data) == 2:
        actual_name, rename_to =  data
        actual_name = actual_name.strip()
        rename_to = rename_to.strip()
    return actual_name, rename_to

def handle_file(lines):
    env_file = ""
    for line in lines:
        actual_name, rename_to = get_name_and_rename(line.strip())
        env_file += f"{rename_to}=\"{env_vars.get(actual_name, "")}\"\n"
    return env_file

for requirement_file in find_env_requirements("."):
    print(f"{requirement_file} -> ", end="")
    with open(requirement_file) as f:
        env_file = handle_file(f.readlines())
    
    requirement_file_path = requirement_file.replace(".env.requirement", ".env")
    print(requirement_file_path)
    with open(requirement_file_path, "w") as f:
        f.write(env_file)