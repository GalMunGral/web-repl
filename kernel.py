while True:
  s = input()
  try:
    exec(s)
    print('\n')
  except Exception as e:
    print(str(e))