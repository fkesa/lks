def main(soal):
    match soal:
        case "25":
            a = 10
            if a > 5:
                print("YES")
            else: 
                print("NO")

        case "26":
            i = 0
            while i < 3: 
                print(i)
                i+=1

        case "27":
            arr = [1,2,3]
            print (len(arr))

        case "28":
            print(len("CTF"))

        case "29":
            a = 2
            a += 5
            print(a)

        case "30":
            print(10 % 3)

        case "31":
            print ("php".upper())

        case "32":
            a = 10
            b = 2
            print(a + b)

        case "33":
            print("CTF" * 3)

        case "34":
            x = 5
            if x % 2 == 0:
                print("Even")
            else:
                print("Odd")

        case "35":
            for i in range(3):
                print(i, end="")

        case "36":
            a = [1,2,3]
            print(len(a))

        case "37":
            print(type(10))

        case "38":
            x = 10
            x += 5
            print(x)

        case "39":
            print(10 // 3)

        case "40":
            print(bool(""))

        case "41":
            print("A".lower())

        # case "42":
            # boolean a = true;
            # boolean b = false;
            # System.out.print(a && b);

        case "43":
            def f(x, arr=[]):
                arr.append(x)
                return arr
            print(f(1))
            print(f(2))

        # case "44":
            # for(let i=0;i<3;i++){
            #   setTimeout(()=>console.log(i),0);
            # }

        # case "45":
        # case "46":
        # case "47":
        # case "48":
        # case "49":
        # case "50":
        # case "51":

if __name__ == '__main__':
    soal = input("Minta soal brp? ")
    main(soal)