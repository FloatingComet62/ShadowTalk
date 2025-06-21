try:
  f = open(".env", "r")
except FileNotFoundError:
  print("First create a .env file with the required variables.")
  exit(1)

OUTPUT = "export const environment = {\n"

content = f.readlines()
for line in content:
  key, value = line.strip().split("=", 1)
  OUTPUT += f"\t{key}: '{value.strip().strip("\"")}',\n"

f.close()

OUTPUT += "};"

with open("src/environment.ts", "w") as f:
  f.write(OUTPUT)