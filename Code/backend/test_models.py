import traceback
try:
    import main
    print('main imported successfully!')
except Exception as e:
    with open('error.log', 'w') as f:
        f.write(traceback.format_exc())
    print('Failed to import main. See error.log')
